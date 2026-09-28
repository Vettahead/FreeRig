using System;
using System.IO;
using System.Linq;
using System.Text;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Web;
using System.Web.Script.Serialization;
using System.Windows.Forms;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace GuitarSuite
{
    public sealed class ToneUser
    {
        public string username, avatar_url, url;
    }
    public sealed class ToneInfo
    {
        public long id;
        public string title, description, gear, format, license, url;
        public string[] images;
        public ToneUser user;
    }
    public sealed class ToneModel
    {
        public long id, tone_id;
        public string name, size, model_url, architecture_version;
    }
    sealed class TonePage
    {
        public ToneModel[] data;
        public int total_pages;
    }
    sealed class ToneSession
    {
        public string access_token, refresh_token;
        public int expires_in;
        public DateTime expires_at;
    }
    sealed class ToneAsset
    {
        public string assetId, assetName;
        public int rate;
        public ToneInfo tone;
        public long modelId;
    }

    // Tokens never enter the page, logs or release folder. Windows binds this vault
    // to the current user. The public OAuth client identifier is intentionally public.
    sealed class Tone3000 : IDisposable
    {
        public const string ClientId = "t3k_pub_k6KW9LGqp9BonrzE9f-u5AVuxckZKGL7";
        public const string Callback = "https://guitarsuite.local/tone3000/callback";
        const string Api = "https://www.tone3000.com/api/v1/";
        readonly string vault, library;
        readonly JavaScriptSerializer json = new JavaScriptSerializer { MaxJsonLength = 4000000 };
        public readonly DeviceLibrary Devices;
        DateTime nextRequest = DateTime.MinValue;
        readonly HttpClient http;
        readonly bool testTransport;
        ToneSession session;
        public ToneInfo SelectedTone;
        public ToneModel[] Models = new ToneModel[0];
        public bool Connected
        {
            get {
                return session != null && !String.IsNullOrEmpty(session.refresh_token);
            }
        }
        public Tone3000(string folder, string assets, HttpMessageHandler transport = null)
        {
            ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;
            library = assets;
            Devices = new DeviceLibrary(assets);
            vault = Path.Combine(folder, "tone3000-session.bin");
            testTransport = transport != null;
            http = new HttpClient(transport ?? new HttpClientHandler { AllowAutoRedirect = false });
            http.Timeout = TimeSpan.FromMinutes(2);
            try
            {
                if (File.Exists(vault))
                    session = json.Deserialize<ToneSession>(
                        Encoding.UTF8.GetString(ProtectedData.Unprotect(
                            File.ReadAllBytes(vault), null, DataProtectionScope.CurrentUser)));
            }
            catch
            {
                session = null;
            }
        }
        public static async Task<string> Preflight()
        {
            ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;
            using (var client = new HttpClient(new HttpClientHandler { AllowAutoRedirect = false }))
            {
                using (var response = await client.GetAsync(
                           AuthorizeUrl(RandomKey(), RandomKey(), "amp", "2")))
                {
                    var location = response.Headers.Location;
                    int status = (int)response.StatusCode;
                    if (status < 300 || status >= 400 || location == null)
                        throw new Exception("Authorisation preflight failed: " + status);
                    return "TONE3000 authorisation endpoint accepted the request: " + status + " " +
                           (location.IsAbsoluteUri ? location.AbsolutePath
                                                   : location.OriginalString.Split('?')[0]);
                }
            }
        }
        public static string Base64Url(byte[] value)
        {
            return Convert.ToBase64String(value).TrimEnd('=').Replace('+', '-').Replace('/', '_');
        }
        public static string RandomKey()
        {
            var bytes = new byte[32];
            using (var rng = RandomNumberGenerator.Create()) rng.GetBytes(bytes);
            return Base64Url(bytes);
        }
        public static string Challenge(string verifier)
        {
            using (var hash = SHA256.Create()) return Base64Url(
                hash.ComputeHash(Encoding.ASCII.GetBytes(verifier)));
        }
        public static bool IsApi(Uri uri)
        {
            return uri.Scheme == "https" && uri.Host == "www.tone3000.com" && uri.IsDefaultPort &&
                   String.IsNullOrEmpty(uri.UserInfo) &&
                   uri.AbsolutePath.StartsWith("/api/v1/", StringComparison.Ordinal);
        }
        public static string ReadCallback(string url, string expectedState)
        {
            Uri uri;
            if (!Uri.TryCreate(url, UriKind.Absolute, out uri) ||
                uri.GetLeftPart(UriPartial.Path) != Callback)
                throw new Exception("Unexpected TONE3000 callback.");
            var q = HttpUtility.ParseQueryString(uri.Query);
            if (String.IsNullOrEmpty(expectedState) || q["state"] != expectedState)
                throw new Exception("TONE3000 sign-in could not be verified. Please try again.");
            if (q["canceled"] == "true")
                throw new OperationCanceledException();
            if (!String.IsNullOrEmpty(q["error"]))
                throw new Exception(
                    "TONE3000 did not authorise this request. Please try signing in again.");
            long id;
            if (String.IsNullOrEmpty(q["code"]) || !Int64.TryParse(q["tone_id"], out id) || id <= 0)
                throw new Exception("TONE3000 did not return a selected tone.");
            return q["code"];
        }
        public static string AuthorizeUrl(string verifier, string state, string kind,
                                          string architecture)
        {
            bool cab = kind == "cab";
            if (kind != "amp" && kind != "cab" && kind != "pedal")
                throw new Exception("Invalid device type.");
            if (architecture != "1" && architecture != "2" && architecture != "custom")
                throw new Exception("Unsupported NAM architecture.");
            return Api + "oauth/authorize?client_id=" + Uri.EscapeDataString(ClientId) +
                   "&redirect_uri=" + Uri.EscapeDataString(Callback) +
                   "&response_type=code&code_challenge=" + Challenge(verifier) +
                   "&code_challenge_method=S256&state=" + Uri.EscapeDataString(state) +
                   "&prompt=select_tone&gears=" +
                   (cab               ? "cab"
                    : kind == "pedal" ? "pedal"
                                      : "amp_amp-cab") +
                   "&format=" + (cab ? "ir" : "nam") +
                   (cab ? "" : "&architecture=" + architecture) + "&menubar=true&preview=true";
        }
        async Task Pace()
        {
            if (testTransport)
                return;
            var wait = nextRequest - DateTime.UtcNow;
            if (wait.TotalMilliseconds > 0)
                await Task.Delay(wait);
            nextRequest = DateTime.UtcNow.AddMilliseconds(800);
        }
        static void Check(HttpResponseMessage response)
        {
            if (response.IsSuccessStatusCode)
                return;
            int status = (int)response.StatusCode;
            throw new Exception(
                status == 401   ? "TONE3000 login expired. Browse TONE3000 to sign in again."
                : status == 403 ? "TONE3000 did not allow access to this tone or integration."
                : status == 429 ? "TONE3000 is busy. Wait a minute before trying again."
                                : "TONE3000 request failed (" + status + "). Please try again.");
        }
        internal async Task StoreTokens(Dictionary<string, string> form)
        {
            await Pace();
            using (var response =
                       await http.PostAsync(Api + "oauth/token", new FormUrlEncodedContent(form)))
            {
                Check(response);
                var next =
                    json.Deserialize<ToneSession>(await response.Content.ReadAsStringAsync());
                if (next == null || String.IsNullOrEmpty(next.access_token) ||
                    String.IsNullOrEmpty(next.refresh_token) || next.expires_in <= 0)
                    throw new Exception("TONE3000 returned an incomplete login.");
                next.expires_at = DateTime.UtcNow.AddSeconds(next.expires_in);
                session = next;
                File.WriteAllBytes(
                    vault, ProtectedData.Protect(Encoding.UTF8.GetBytes(json.Serialize(next)), null,
                                                 DataProtectionScope.CurrentUser));
            }
        }
        async Task<string> Token()
        {
            if (session == null)
                throw new Exception("Browse TONE3000 to sign in first.");
            if (DateTime.UtcNow >= session.expires_at.AddSeconds(-60))
                await StoreTokens(
                    new Dictionary<string, string> { { "grant_type", "refresh_token" },
                                                     { "refresh_token", session.refresh_token },
                                                     { "client_id", ClientId } });
            return session.access_token;
        }
        async Task<T> Get<T>(string route)
        {
            var token = await Token();
            using (var request = new HttpRequestMessage(HttpMethod.Get, Api + route))
            {
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
                await Pace();
                using (var response = await http.SendAsync(request))
                {
                    if (response.StatusCode == HttpStatusCode.Unauthorized)
                    {
                        session.expires_at = DateTime.MinValue;
                        throw new Exception("TONE3000 login expired. Try again to refresh it, or " +
                                            "browse to sign in.");
                    }
                    Check(response);
                    return json.Deserialize<T>(await response.Content.ReadAsStringAsync());
                }
            }
        }
        public async Task Select(Form owner, CoreWebView2Environment environment, string kind,
                                 string architecture)
        {
            string verifier = RandomKey(), state = RandomKey();
            string callback = await ToneLogin.Open(
                owner, environment, AuthorizeUrl(verifier, state, kind, architecture));
            string code = ReadCallback(callback, state);
            long toneId =
                Int64.Parse(HttpUtility.ParseQueryString(new Uri(callback).Query)["tone_id"]);
            await StoreTokens(
                new Dictionary<string, string> { { "grant_type", "authorization_code" },
                                                 { "code", code },
                                                 { "code_verifier", verifier },
                                                 { "redirect_uri", Callback },
                                                 { "client_id", ClientId } });
            await LoadTone(toneId, kind, architecture);
        }
        public async Task LoadTone(long id, string kind, string architecture)
        {
            bool cab = kind == "cab";
            if (id <= 0)
                throw new Exception("Invalid tone.");
            if (architecture != "1" && architecture != "2" && architecture != "custom")
                throw new Exception("Invalid architecture.");
            var tone =
                await Get<ToneInfo>("tones/" + id + (cab ? "" : "?architecture=" + architecture));
            if (tone == null || tone.id != id || tone.format != (cab ? "ir" : "nam") ||
                (cab               ? tone.gear != "cab"
                 : kind == "pedal" ? tone.gear != "pedal"
                                   : tone.gear != "amp" && tone.gear != "amp-cab"))
                throw new Exception("Choose a compatible amp, cabinet or pedal tone.");
            var models = new List<ToneModel>();
            for (int page = 1; page <= 20; page++)
            {
                var result =
                    await Get<TonePage>("models?tone_id=" + id + "&page_size=300&page=" + page +
                                        (cab ? "" : "&architecture=" + architecture));
                if (result == null || result.data == null)
                    throw new Exception("TONE3000 returned no model list.");
                models.AddRange(result.data.Where(m => m.tone_id == id));
                if (page >= result.total_pages)
                    break;
                if (page == 20)
                    throw new Exception("This tone has too many models to load in this alpha.");
            }
            if (models.Count == 0)
                throw new Exception(
                    "This tone has no models in the selected format. Try another architecture.");
            SelectedTone = tone;
            Models = models.ToArray();
        }
        public async Task<ToneUser> User()
        {
            return await Get<ToneUser>("user");
        }
        static async Task ValidateDownloadUri(Uri uri)
        {
            if (uri.Scheme != "https" || !uri.IsDefaultPort ||
                !String.IsNullOrEmpty(uri.UserInfo) || uri.IsLoopback)
                throw new Exception("TONE3000 returned an unsupported download address.");
            var addresses = await Dns.GetHostAddressesAsync(uri.DnsSafeHost);
            if (addresses.Length == 0)
                throw new Exception("Download server not found.");
            foreach (var address in addresses)
            {
                var ip = address.IsIPv4MappedToIPv6 ? address.MapToIPv4() : address;
                var b = ip.GetAddressBytes();
                bool privateIp = IPAddress.IsLoopback(ip) || ip.IsIPv6LinkLocal ||
                                 ip.IsIPv6SiteLocal || (b.Length == 16 && (b[0] & 254) == 252) ||
                                 (b.Length == 4 && (b[0] == 0 || b[0] == 10 || b[0] == 127 ||
                                                    b[0] >= 224 || (b[0] == 169 && b[1] == 254) ||
                                                    (b[0] == 172 && b[1] >= 16 && b[1] <= 31) ||
                                                    (b[0] == 192 && b[1] == 168)));
                if (privateIp)
                    throw new Exception("Download address is not a public server.");
            }
        }
        public async Task<ToneAsset> Download(long modelId)
        {
            var model = Models.SingleOrDefault(m => m.id == modelId);
            if (model == null || SelectedTone == null)
                throw new Exception("Choose a model from the current tone.");
            var cached = Devices.Find(SelectedTone.id, modelId);
            if (cached != null)
                return new ToneAsset { assetId = cached.assetId, assetName = cached.name,
                                       rate = cached.rate, tone = SelectedTone, modelId = modelId };
            // Refresh the URL on demand rather than persisting signed download links.
            model = await Get<ToneModel>("models/" + modelId);
            if (model == null || model.tone_id != SelectedTone.id)
                throw new Exception("The model is no longer part of this tone.");
            Uri uri;
            if (!Uri.TryCreate(model.model_url, UriKind.Absolute, out uri) || !IsApi(uri))
                throw new Exception("Unexpected TONE3000 model URL. No credentials were sent.");
            bool cab = SelectedTone.format == "ir";
            int max = cab ? 20000000 : 128000000;
            string id = Guid.NewGuid().ToString("N") + (cab ? ".wav" : ".nam"),
                   destination = Path.Combine(library, id),
                   temp = Path.Combine(library, "download-" + id);
            try
            {
                for (int redirects = 0; redirects <= 5; redirects++)
                {
                    if (!testTransport)
                        await ValidateDownloadUri(uri);
                    using (var request = new HttpRequestMessage(HttpMethod.Get, uri))
                    {
                        if (IsApi(uri))
                            request.Headers.Authorization =
                                new AuthenticationHeaderValue("Bearer", await Token());
                        await Pace();
                        using (var response = await http.SendAsync(
                                   request, HttpCompletionOption.ResponseHeadersRead))
                        {
                            int status = (int)response.StatusCode;
                            if (status >= 300 && status < 400 && response.Headers.Location != null)
                            {
                                uri = new Uri(uri, response.Headers.Location);
                                continue;
                            }
                            Check(response);
                            if (response.Content.Headers.ContentLength > max)
                                throw new Exception(
                                    "This model is too large for the desktop alpha.");
                            using (
                                var deadline = new System.Threading.CancellationTokenSource(TimeSpan.FromMinutes(
                                    2))) using (var source =
                                                    await response.Content
                                                        .ReadAsStreamAsync()) using (var target =
                                                                                         new FileStream(
                                                                                             temp,
                                                                                             FileMode
                                                                                                 .CreateNew,
                                                                                             FileAccess
                                                                                                 .Write,
                                                                                             FileShare
                                                                                                 .None,
                                                                                             81920,
                                                                                             true))
                            {
                                var buffer = new byte[81920];
                                int count, total = 0;
                                while ((count = await source.ReadAsync(buffer, 0, buffer.Length,
                                                                       deadline.Token)) > 0)
                                {
                                    total += count;
                                    if (total > max)
                                        throw new Exception(
                                            "This model is too large for the desktop alpha.");
                                    await target.WriteAsync(buffer, 0, count, deadline.Token);
                                }
                            }
                            int rate = await Task.Run(
                                () =>
                                {
                                    IntPtr probe = Nam.gs_load(temp, 0, 4096);
                                    if (probe == IntPtr.Zero)
                                        throw new Exception("Downloaded model could not load: " +
                                                            Nam.Error);
                                    try
                                    {
                                        return Nam.gs_rate(probe);
                                    }
                                    finally
                                    {
                                        Nam.gs_free(probe);
                                    }
                                });
                            File.Move(temp, destination);
                            File.WriteAllText(destination + ".json", json.Serialize(new {
                                tone = SelectedTone, modelId = model.id, modelName = model.name,
                                rate = rate, architecture = model.architecture_version,
                                downloadedAt = DateTime.UtcNow
                            }));
                            Devices.Add(
                                SelectedTone,
                                new SavedModel { id = model.id, name = model.name, assetId = id,
                                                 rate = rate > 0 ? rate : 48000,
                                                 architecture = model.architecture_version });
                            return new ToneAsset { assetId = id, assetName = model.name,
                                                   rate = rate > 0 ? rate : 48000,
                                                   tone = SelectedTone, modelId = model.id };
                        }
                    }
                }
                throw new Exception("Too many redirects downloading this model.");
            }
            finally
            {
                if (File.Exists(temp))
                    File.Delete(temp);
            }
        }
        public void Disconnect()
        {
            session = null;
            SelectedTone = null;
            Models = new ToneModel[0];
            if (File.Exists(vault))
                File.Delete(vault);
        }
        public void Dispose()
        {
            http.Dispose();
        }
    }

    // This window hosts only the official sign-in/catalogue. It has no native bridge.
    // The callback is intercepted before navigation, so no local web server is needed.
    static class ToneLogin
    {
        public static async Task<string> Open(Form owner, CoreWebView2Environment environment,
                                              string url)
        {
            var done = new TaskCompletionSource<string>();
            using (var form = new Form {
                Text = "TONE3000 — Sign in and choose a tone", Width = 1050, Height = 820,
                StartPosition = FormStartPosition.CenterParent
            }) using (var view = new WebView2 { Dock = DockStyle.Fill })
            {
                form.Controls.Add(view);
                form.FormClosed += (s, e) => done.TrySetCanceled();
                form.Show(owner);
                await view.EnsureCoreWebView2Async(environment);
                view.CoreWebView2.Settings.IsWebMessageEnabled = false;
                view.CoreWebView2.Settings.AreDevToolsEnabled = false;
                view.CoreWebView2.PermissionRequested += (s, e) =>
                { e.State = CoreWebView2PermissionState.Deny; };
                view.CoreWebView2.NavigationStarting += (s, e) =>
                {
                    Uri uri;
                    if (!Uri.TryCreate(e.Uri, UriKind.Absolute, out uri))
                    {
                        e.Cancel = true;
                        return;
                    }
                    if (uri.GetLeftPart(UriPartial.Path) == Tone3000.Callback)
                    {
                        e.Cancel = true;
                        done.TrySetResult(e.Uri);
                        form.Close();
                    }
                    else if (uri.Scheme != "https")
                    {
                        e.Cancel = true;
                    }
                };
                view.CoreWebView2.NewWindowRequested += (s, e) =>
                {
                    e.Handled = true;
                    Uri uri;
                    if (Uri.TryCreate(e.Uri, UriKind.Absolute, out uri) && uri.Scheme == "https" &&
                        uri.Host == "www.tone3000.com")
                        view.CoreWebView2.Navigate(uri.AbsoluteUri);
                };
                view.CoreWebView2.DownloadStarting += (s, e) => e.Cancel = true;
                view.Source = new Uri(url);
                return await done.Task;
            }
        }
    }
}
