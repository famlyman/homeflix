import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { fetchItemDetails } from "../../services/tmdb-trakt";
import Constants from "expo-constants";
import { checkItemInLists } from "../../services/traktapi";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import MyLists from "../../components/listModal";
import axios from "axios";
import { Picker } from "@react-native-picker/picker";
import { FlashList } from "@shopify/flash-list";
import { scrapeLinks, submitToPremiumize } from "@/components/scraper"; // Import from MagnetScraper

const { width, height } = Dimensions.get("window");
const TMDB_API_KEY = Constants.expoConfig?.extra?.TMDB_API;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

interface ItemDetails {
  id: number;
  title: string;
  posterUrl: string | null;
  overview: string;
  year: string;
  genres: string[];
  rating: number;
  seasons?: number;
  backdropUrl?: string;
}

interface Episode {
  episode_number: number;
  name: string;
  air_date?: string;
  overview?: string;
}

export default function ItemDetailsScreen() {
  const { id, type, title, listId } = useLocalSearchParams<{
    id: string;
    type: "movie" | "show";
    title: string;
    listId: string;
  }>();
  const router = useRouter();

  const [itemDetails, setItemDetails] = useState<ItemDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [scrapeLoading, setScrapeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isInList, setIsInList] = useState(false);
  const [seasons, setSeasons] = useState<{ season_number: number }[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const numericId = parseInt(id, 10);

  useEffect(() => {
    const testNetwork = async () => {
      try {
        const response = await axios.get("https://jsonplaceholder.typicode.com/todos/1");
        console.log("Network Test Success:", response.data);
      } catch (err) {
        if (err instanceof Error) {
          console.error("Network Test Error:", err.message);
        } else {
          console.error("Network Test Error:", "An unknown error occurred");
        }
      }
    };
    testNetwork();
  }, []);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const details = await fetchItemDetails(numericId, type);
        setItemDetails(details);

        if (listId) {
          const { listIds }: { listIds: number[] } = await checkItemInLists(numericId, type);
          setIsInList(listIds.includes(parseInt(listId)));
        }

        if (type === "show") {
          const response = await axios.get(
            `${TMDB_BASE_URL}/tv/${numericId}?api_key=${TMDB_API_KEY}`
          );
          setSeasons(response.data.seasons.filter((s: any) => s.season_number > 0));
          setSelectedSeason(response.data.seasons[0]?.season_number || 1);
        }
      } catch (err: any) {
        console.error("Fetch Error:", err.message);
        setError(err.message || "Failed to fetch item details");
      } finally {
        setLoading(false);
      }
    };

    if (id && type) fetchDetails();
  }, [id, type, listId]);

  useEffect(() => {
    if (type !== "show" || !selectedSeason) return;
    const fetchEpisodes = async () => {
      try {
        const response = await axios.get(
          `${TMDB_BASE_URL}/tv/${numericId}/season/${selectedSeason}?api_key=${TMDB_API_KEY}`
        );
        setEpisodes(response.data.episodes);
      } catch (err: any) {
        console.error("Error fetching episodes:", err);
        setError("Failed to fetch episodes");
      }
    };
    fetchEpisodes();
  }, [selectedSeason, type, numericId]);

  const openModal = () => setIsModalVisible(true);
  const closeModal = () => {
    setIsModalVisible(false);
    if (listId) {
      checkItemInLists(numericId, type)
        .then(({ listIds }: { listIds: number[] }) => setIsInList(listIds.includes(parseInt(listId))))
        .catch((err: any) => console.error("Error refreshing list status:", err));
    }
  };

  const handleScrape = async (searchTerm: string) => {
    setScrapeLoading(true);
    const targetUrl = "https://example.com";
    const links = await scrapeLinks(targetUrl);
    setScrapeLoading(false);

    if (links.length > 0) {
      Alert.alert(
        "Links Found",
        `Found ${links.length} Premiumize-supported links for "${searchTerm}". Submit to Premiumize?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Submit",
            onPress: async () => {
              for (const link of links) {
                await submitToPremiumize(link);
              }
              Alert.alert("Success", "Links submitted to Premiumize!");
            },
          },
        ]
      );
    } else {
      Alert.alert("No Links", `No Premiumize-supported links found for "${searchTerm}".`);
    }
  };

  const handleMoviePress = () => {
    if (itemDetails?.title) {
      handleScrape(itemDetails.title);
    }
  };

  const handleEpisodePress = (episode: Episode) => {
    if (itemDetails?.title && selectedSeason) {
      const searchTerm = `${itemDetails.title} S${selectedSeason.toString().padStart(2, "0")}E${episode.episode_number.toString().padStart(2, "0")}`;
      handleScrape(searchTerm);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!itemDetails) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No details available for {title}</Text>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <ScrollView style={styles.scrollView}>
        {itemDetails.backdropUrl && (
          <Image
            source={{ uri: itemDetails.backdropUrl }}
            style={styles.backdropImage}
            resizeMode="cover"
          />
        )}
        <View style={styles.backIconContainer}>
          <TouchableOpacity style={styles.backIcon} onPress={() => router.back()}>
            <Icon name="arrow-left" size={30} strokeWidth={2} color="white" />
          </TouchableOpacity>
          {listId && (
            <Pressable onPress={openModal}>
              <Icon name="cards-heart" size={30} strokeWidth={2} color={isInList ? "red" : "white"} />
            </Pressable>
          )}
        </View>

        <View style={styles.detailsBackground}>
          <Image
            source={require("@/assets/images/bg.jpg")}
            style={styles.detailsBackgroundImage}
            resizeMode="cover"
          />
          <View style={styles.contentContainer}>
            <TouchableOpacity onPress={handleMoviePress} disabled={scrapeLoading}>
              <View style={styles.posterContainer}>
                {itemDetails.posterUrl && (
                  <Image
                    source={{ uri: itemDetails.posterUrl }}
                    style={styles.posterImage}
                    resizeMode="cover"
                  />
                )}
              </View>
              <View style={styles.infoContainer}>
                <Text style={styles.title}>{title}</Text>
                {itemDetails.year && (
                  <Text style={styles.releaseDate}>Released: {itemDetails.year}</Text>
                )}
                {itemDetails.rating > 0 && (
                  <Text style={styles.rating}>Rating: {itemDetails.rating.toFixed(1)}/10</Text>
                )}
                {itemDetails.genres && itemDetails.genres.length > 0 && (
                  <Text style={styles.genres}>Genres: {itemDetails.genres.join(", ")}</Text>
                )}
                {type === "show" && itemDetails.seasons && (
                  <Text style={styles.runtime}>Seasons: {itemDetails.seasons}</Text>
                )}
                {scrapeLoading && (
                  <ActivityIndicator size="small" color="#ffffff" style={{ marginTop: 8 }} />
                )}
              </View>
            </TouchableOpacity>

            <View style={styles.overviewContainer}>
              <Text style={styles.overviewTitle}>Overview</Text>
              <Text style={styles.overview}>{itemDetails.overview}</Text>
            </View>

            {type === "show" && episodes.length > 0 && (
              <View style={styles.seasonContainer}>
                <Text style={styles.overviewTitle}>Episodes</Text>
                <Picker
                  selectedValue={selectedSeason}
                  onValueChange={(value: React.SetStateAction<number | null>) => setSelectedSeason(value)}
                  style={styles.picker}
                  dropdownIconColor="white"
                >
                  {seasons.map((season) => (
                    <Picker.Item
                      key={season.season_number}
                      label={`Season ${season.season_number}`}
                      value={season.season_number}
                      color="black"
                    />
                  ))}
                </Picker>
                <FlashList
                  data={episodes}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => handleEpisodePress(item)}
                      disabled={scrapeLoading}
                      style={styles.episode}
                    >
                      <Text style={styles.episodeTitle}>
                        S{selectedSeason}E{item.episode_number} - {item.name}
                      </Text>
                      {item.air_date && (
                        <Text style={styles.episodeSubtitle}>({item.air_date})</Text>
                      )}
                      {item.overview && (
                        <Text style={styles.episodeOverview}>{item.overview}</Text>
                      )}
                      {scrapeLoading && (
                        <ActivityIndicator size="small" color="#ffffff" style={{ marginTop: 8 }} />
                      )}
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item) => `${item.episode_number}`}
                  estimatedItemSize={50}
                />
              </View>
            )}
          </View>
        </View>
      </ScrollView>
      {listId && (
        <MyLists visible={isModalVisible} onClose={closeModal} itemId={numericId} type={type} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#000" },
  scrollView: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, fontSize: 16, color: "white" },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  errorText: { fontSize: 16, textAlign: "center", color: "white" },
  backdropImage: { width, height: height * 0.5 },
  backIconContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  backIcon: { backgroundColor: "rgba(0, 0, 0, 0.5)", borderRadius: 50, padding: 5, margin: 5 },
  detailsBackground: { position: "relative", width: "100%" },
  detailsBackgroundImage: { position: "absolute", width: "100%", height: "100%" },
  contentContainer: { padding: 16, backgroundColor: "transparent", position: "relative", zIndex: 1 },
  posterContainer: { alignItems: "center", marginBottom: 20 },
  posterImage: {
    width: width * 0.4,
    height: height * 0.3,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoContainer: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 8, color: "white", textAlign: "center" },
  releaseDate: { fontSize: 14, marginBottom: 4, color: "white", textAlign: "center" },
  rating: { fontSize: 14, marginBottom: 4, color: "white", textAlign: "center" },
  runtime: { fontSize: 14, marginBottom: 4, color: "white", textAlign: "center" },
  genres: { fontSize: 14, marginBottom: 4, color: "white", textAlign: "center" },
  overviewContainer: { marginTop: 16 },
  overviewTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 8, color: "white" },
  overview: { fontSize: 14, lineHeight: 22, color: "white" },
  seasonContainer: { marginTop: 16 },
  picker: { color: "white", backgroundColor: "rgba(0, 0, 0, 0.5)", borderRadius: 8, marginBottom: 10 },
  episode: { backgroundColor: "rgba(0, 0, 0, 0.5)", borderRadius: 8, padding: 10, marginBottom: 8 },
  episodeTitle: { fontSize: 16, fontWeight: "bold", color: "white", marginBottom: 5 },
  episodeSubtitle: { fontSize: 14, color: "#A9A9A9", marginBottom: 5 },
  episodeOverview: { fontSize: 14, color: "white", marginBottom: 10 },
});