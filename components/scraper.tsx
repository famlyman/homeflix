import React, { useState } from "react";
import { View, Text, Button, StyleSheet, FlatList } from "react-native";
import axios from "axios";
import { load } from "react-native-cheerio";
import Constants from "expo-constants";

// Define the structure of regexpatterns
interface RegexPatterns {
  [key: string]: string[];
}

// Premiumize services data with typed regexpatterns
const PREMIUMIZE_SERVICES = {
  cache: [
    "wupfile.com",
    "rapidrar.com",
    "rapidgator.net",
    "filefactory.com",
    "mediafire.com",
    "turbobit.net",
    "hexload.com",
    "filesmonster.com",
    "1fichier.com",
    "filer.net",
    "uploadgig.com",
    "drop.download",
    "file.al",
    "hitfile.net",
    "filenext.com",
    "uploadboy.com",
    "katfile.com",
    "streamtape.com",
    "clicknupload.to",
    "ulozto.net",
    "alfafile.net",
    "vidoza.net",
    "isra.cloud",
    "mega.nz",
    "modsbase.com",
    "filestore.to",
    "ddownload.com",
    "filecat.net",
    "uploadrar.com",
    "usersdrive.com",
    "fastfile.cc",
  ],
  directdl: [
    "wupfile.com",
    "mediafire.com",
    "turbobit.net",
    "hexload.com",
    "filesmonster.com",
    "1fichier.com",
    "filer.net",
    "uploadgig.com",
    "drop.download",
    "file.al",
    "filenext.com",
    "uploadboy.com",
    "katfile.com",
    "streamtape.com",
    "ulozto.net",
    "alfafile.net",
    "vidoza.net",
    "isra.cloud",
    "mega.nz",
    "modsbase.com",
    "filestore.to",
    "ddownload.com",
    "filecat.net",
  ],
  queue: ["rapidgator.net", "hitfile.net", "clicknupload.to"],
  regexpatterns: {
    "wupfile.com": ["https?://[^/]*wupfile.com/[a-z0-9]{12}.*"],
    "rapidrar.com": [
      "https?://[^/]*rapidrar.com/.*",
      "https?://[^/]*rapidrar.cr/.*",
      "https?://[^/]*rapidrar.xyz/.*",
    ],
    "rapidgator.net": [
      "https?://(www\\.)?(rapidgator\\.net|rg\\.to|rapidgator\\.host)/file/([a-zA-Z0-9]+)?(/.*)?",
    ],
    "filefactory.com": ["https?://[^/]*filefactory.com/file/([^/]+)(/[^/]+)?(/[^/]+)?"],
    "mediafire.com": ["https?://[^/]*mediafire.com/.*"],
    "turbobit.net": [
      "([^/]+\\.)?turbobit\\.net/[a-zA-Z0-9]+/?.*\\.html",
      "https://turo-bit.net/.*",
      "https://turbo.to/.*",
      "https://turbobit.cc/.*",
      "https://turb.to/.*",
      "https://turb.cc/.*",
      "https://turbobif.com/.*",
      "https://trbbt.net/.*",
    ],
    "hexload.com": ["https?://[^/]*hexload.com/[a-z0-9]{12}.*"],
    "filesmonster.com": [
      "https?://(www\\.)?filesmonster\\.com/download.php\\?id=.+",
      "https?://(www\\.)?filesmonster\\.com/folders.php\\?fid=.+",
      "https?://(www\\.)?filesmonster\\.com/dl/.*?/free/.*?/.+",
    ],
    "1fichier.com": ["https?://1fichier.com/?\\?([a-zA-Z0-9]+)"],
    "filer.net": ["https?://[^/]*filer.net/get/.*"],
    "uploadgig.com": ["https?://(www\\.)?uploadgig\\.com/file/download/([^/]+/?[^/]*)"],
    "drop.download": [
      "https?://[^/]*drop.download/[a-z0-9]{12}.*",
      "https?://[^/]*dropapk.com/[a-z0-9]{12}.*",
      "https?://[^/]*dropapk.to/[a-z0-9]{12}.*",
    ],
    "file.al": ["https?://[^/]*file.al/[a-z0-9]{12}.*"],
    "hitfile.net": [
      "https?://(www\\.)?(hitfile\\.net)/([a-zA-Z0-9]+)/?([^/<>]+\\.html)?",
      "https?://(www\\.)?(hitfile\\.net)/.*",
      "https?://(www\\.)?(hitfile\\.net)/download/free/*",
      "https?://(www\\.)?(hitf\\.to)/([a-zA-Z0-9]+)/?([^/<>]+\\.html)?",
      "https?://(www\\.)?(hitf\\.to)/.*",
      "https?://(www\\.)?(hitf\\.to)/download/free/",
      "https?://(www\\.)?(hitf\\.cc)/([a-zA-Z0-9]+)/?([^/<>]+\\.html)?",
      "https?://(www\\.)?(hitf\\.cc)/.*",
      "https?://(www\\.)?(hitf\\.cc)/download/free/",
    ],
    "filenext.com": ["https?://[^/]*filenext.com/.*"],
    "uploadboy.com": ["https?://[^/]*uploadboy.com/.*", "https?://[^/]*uploadboy.me/.*"],
    "katfile.com": ["https?://[^/]*katfile.com/[a-z0-9]{12}.*"],
    "streamtape.com": ["https?://[^/]*streamtape.com/v/.*", "https?://[^/]*streamtape.to/v/.*"],
    "clicknupload.to": [
      "https?://[^/]*clicknupload.org/(vidembed\\-)?[a-z0-9]{12}",
      "https?://[^/]*clicknupload.co/(vidembed\\-)?[a-z0-9]{12}",
      "https?://[^/]*clicknupload.cc/(vidembed\\-)?[a-z0-9]{12}",
      "https?://[^/]*clicknupload.to/(vidembed\\-)?[a-z0-9]{12}",
      "https?://[^/]*clicknupload.club/(vidembed\\-)?[a-z0-9]{12}",
      "https?://[^/]*clicknupload.click/(vidembed\\-)?[a-z0-9]{12}",
      "https?://[^/]*clicknupload.red/(vidembed\\-)?[a-z0-9]{12}",
      "https?://[^/]*clicknupload.xyz/(vidembed\\-)?[a-z0-9]{12}",
      "https?://[^/]*clicknupload.site/(vidembed\\-)?[a-z0-9]{12}",
      "https?://[^/]*clicknupload.online/(vidembed\\-)?[a-z0-9]{12}",
      "https?://[^/]*clicknupload.download/(vidembed\\-)?[a-z0-9]{12}",
      "https?://[^/]*clickndownload.click/(vidembed\\-)?[a-z0-9]{12}",
      "https?://[^/]*clickndownload.cc/(vidembed\\-)?[a-z0-9]{12}",
      "https?://[^/]*clicknupload.space/(vidembed\\-)?[a-z0-9]{12}",
      "https:\\/\\/clickn(?:download|upload).(?:[a-zA-Z]+.?)+\\/[a-zA-Z0-9]+$",
      "https?://[^/]*clickndownload.link/(vidembed\\-)?[a-z0-9]{12}",
    ],
    "ulozto.net": [
      "https?://[^/]*ulozto.net/.*",
      "https?://[^/]*uloz.to/.*",
      "https?://[^/]*ulozto.sk/.*",
      "https?://[^/]*zachowajto.pl/.*",
      "https?://[^/]*ulozto.cz/.*",
    ],
    "alfafile.net": ["https?://(www\\.)?alfafile\\.net/file/([^/]+/?[^/]*)"],
    "vidoza.net": ["https?://[^/]*vidoza.net/.*", "https?://[^/]*vidoza.org/.*"],
    "isra.cloud": [
      "https?://[^/]*isra.cloud/[a-z0-9]{12}.*",
      "https?://[^/]*israbox.ch/[a-z0-9]{12}.*",
      "https?://[^/]*isrbx.net/[a-z0-9]{12}.*",
      "https?://[^/]*isrbx.net/go/.*",
      "https?://[^/]*israbox-music.org/.*",
      "https?://[^/]*isrbx.me/.*",
    ],
    "mega.nz": [
      "https?://[^/]*mega.nz/\\#(.*)",
      "https?://[^/]*mega.co.nz*?/\\#(.*)",
      "https?://[^\\/]*mega\\.nz\\/folder\\/\\w+\\#\\w+/file/\\w+",
    ],
    "modsbase.com": [
      "https?://(www\\.)?modsbase\\.com/([^/]+/?[^/]*)",
      "https?://(www\\.)?uploadfiles\\.eu([^/]+/?[^/]*)",
    ],
    "filestore.to": ["https?://[^/]*filestore.to/[?]d=[A-Z0-9]+"],
    "ddownload.com": [
      "https?://[^/]*ddownload.com/[a-z0-9]{12}.*",
      "https?://[^/]*ddl.to/[a-z0-9]{12}.*",
    ],
    "filecat.net": ["https?://[^/]filecat.net/f/.*"],
    "uploadrar.com": ["https?://[^/]*uploadrar.com/[a-z0-9]{12}.*"],
    "usersdrive.com": ["https?://[^/]*usersdrive.com/[a-z0-9]{12}.*"],
    "fastfile.cc": ["https?://[^/]*fastfile.cc/[a-z0-9]{12}.*"],
  } as RegexPatterns,
};

export const scrapeLinks = async (targetUrl: string): Promise<string[]> => {
  console.log("Scraping URL:", targetUrl);
  try {
    // Step 1: Fetch the search page
    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    };
    const response = await axios.get(targetUrl, { headers, timeout: 30000 });
    console.log("Search Page Status:", response.status);
    console.log("Search Page Snippet (start):", response.data.substring(0, 500));
    console.log("Search Page Snippet (end):", response.data.substring(response.data.length - 500));

    const html = response.data;
    const $ = load(html);

    // Step 2: Extract sanet.st post links
    const postLinks: string[] = [];
    $("h2.entry-title a").each((_: any, element: any) => {
      const href = $(element).attr("href");
      if (href && href.includes("blogs")) {
        postLinks.push(href.startsWith("http") ? href : `https://sanet.st${href}`);
      }
    });
    console.log("Found Post Links:", postLinks);

    // Step 3: Scrape up to 3 posts for download links
    const downloadLinks: string[] = [];
    const supportedHosts = [
      "mega.nz", "1fichier.com", "rapidgator.net", "uploaded.net",
      "filefactory.com", "turbobit.net", "zippyshare.com", "mediafire.com",
      "file.io", "sendspace.com",
    ];

    for (const postUrl of postLinks.slice(0, 3)) {
      console.log("Scraping Post URL:", postUrl);
      const postResponse = await axios.get(postUrl, { headers, timeout: 30000 });
      const postHtml = postResponse.data;
      const $post = load(postHtml);

      $post("a[href]").each((_: any, element: any) => {
        const href = $post(element).attr("href");
        if (href && supportedHosts.some(host => href.includes(host))) {
          downloadLinks.push(href);
        }
      });
    }

    console.log("Found Download Links:", downloadLinks);
    return [...new Set(downloadLinks)];
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error("Scraping Error Details:", {
        message: err.message,
        code: err.code,
        config: err.config,
        response: err.response ? { status: err.response.status, data: err.response.data } : "No response",
      });
    } else if (err instanceof Error) {
      console.error("Scraping Error:", err.message);
    } else {
      console.error("Unknown Scraping Error:", err);
    }
    return [];
  }
};

export const submitToPremiumize = async (link: string) => {
  const PREMIUMIZE_API_KEY = Constants.expoConfig?.extra?.premiumizeApiKey as string;
  try {
    const response = await axios.post(
      "https://www.premiumize.me/api/transfer/direct/create",
      { src: link, apikey: PREMIUMIZE_API_KEY },
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
    console.log(`Submitted ${link} to Premiumize:`, response.data);
    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error("Premiumize Error:", err.message, err.response?.data);
    } else if (err instanceof Error) {
      console.error("Premiumize Error:", err.message);
    } else {
      console.error("Premiumize Error:", err);
    }
    return null;
  }
};
  
  const MagnetScraper = () => {
    const [links, setLinks] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
  
    const handleScrapeAndSubmit = async (targetUrl: string = "https://sanet.st") => {
      setLoading(true);
      setError(null);
      const foundLinks = await scrapeLinks(targetUrl);
      setLinks(foundLinks);
      setLoading(false);
  
      if (foundLinks.length > 0) {
        for (const link of foundLinks) {
          await submitToPremiumize(link);
        }
      }
    };
  
    return (
      <View style={styles.container}>
        <Button
          title={loading ? "Scraping..." : "Scrape Premiumize Links"}
          onPress={() => handleScrapeAndSubmit()}
          disabled={loading}
        />
        {error && <Text style={styles.error}>{error}</Text>}
        {links.length > 0 && (
          <View style={styles.results}>
            <Text style={styles.title}>Found Links:</Text>
            <FlatList
              data={links}
              renderItem={({ item }) => <Text style={styles.link}>{item.substring(0, 20)}...</Text>}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        )}
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: { padding: 16, alignItems: "center" },
    title: { fontSize: 18, fontWeight: "bold", marginVertical: 8 },
    link: { fontSize: 14, color: "#333" },
    error: { color: "red", marginTop: 8 },
    results: { marginTop: 16 },
  });
  
  export default MagnetScraper;
