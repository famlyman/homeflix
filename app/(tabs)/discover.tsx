import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, StyleSheet, FlatList, View, TextInput, TouchableOpacity, Keyboard, Image, Text, ImageBackground, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getUpcomingMovies, getPopularMovies, searchMovies, getTrendingShows, searchShows, image500 } from '@/services/tmdbapi';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { debounce } from 'lodash';

interface Movie {
    id: number;
    title: string;
    adult: boolean;
    backdrop_path: string;
    genre_ids: number[];
    original_language: string;
    original_title: string;
    overview: string;
    popularity: number;
    poster_path: string;
    release_date: string;
    video: boolean;
  }

  interface TVShow {
    id: number;
    name: string;
    poster_path: string;
  }
  
  interface MediaCategory {
    title: string;
    data: (Movie | TVShow)[];
    type: 'movie' | 'tv';
  }


const { width, height } = Dimensions.get('window')


export const discover = () => {
    const [categories, setCategories] = useState<MediaCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [initialLoading, setInitialLoading] = useState(true);
    const [searchLoading, setSearchLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<(Movie | TVShow)[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchType, setSearchType] = useState<'movie' | 'tv'>('movie');

    const handleMoviePress = (id: number) => {
      router.push({
        pathname: "/movie/[id]" as "/",
        params: { id: id.toString() }
      });
    };

    const handleShowPress = (id: number) => {
      router.push({
        pathname: "/show/[id]" as "/",
        params: { id: id.toString() }
      });
    };

    useEffect(() => {
        const fetchMedia = async () => {
          try {
            setInitialLoading(true);
            // Fetch multiple categories of movies and TV shows
            const [upcomingData, popularMovieData, trendingTVData] = await Promise.all([
              getUpcomingMovies(),
              getPopularMovies(),
              getTrendingShows(),
            ]);
    
            // Filter out items with null poster_path to prevent empty URI errors
            const upcomingFiltered = upcomingData.results.filter((movie: Movie) => movie.poster_path != null);
            const popularMoviesFiltered = popularMovieData.results.filter((movie: Movie) => movie.poster_path != null);
            const trendingTVFiltered = trendingTVData.results.filter((show: TVShow) => show.poster_path != null);
    
            setCategories([
              { title: 'Upcoming Movies', data: upcomingFiltered, type: 'movie' },
              { title: 'Popular Movies', data: popularMoviesFiltered, type: 'movie' },
              { title: 'Trending TV Shows', data: trendingTVFiltered, type: 'tv' },
            ]);
          } catch (err) {
            console.error('Error fetching media:', err);
            setError('Failed to load movies and TV shows');
          } finally {
            setInitialLoading(false);
            setLoading(false);
          }
        };
        fetchMedia();
      }, []);
    
      // Create a debounced search function that will be defined once and persist across renders
      const debouncedSearch = useCallback(
        debounce(async (query: string, type: 'movie' | 'tv') => {
          if (query.trim().length < 2) {
            setIsSearching(false);
            setSearchResults([]);
            setSearchLoading(false);
            return;
          }
    
          try {
            let results;
            if (type === 'movie') {
              results = await searchMovies(query);
            } else {
              results = await searchShows(query);
            }
            // Filter out items with null poster_path to prevent empty URI errors
            const filteredResults = results.results.filter((item: Movie | TVShow) => item.poster_path != null);
            setSearchResults(filteredResults);
          } catch (err) {
            console.error(`Error searching ${type}s:`, err);
            setError(`Failed to search ${type}s`);
          } finally {
            setSearchLoading(false);
          }
        }, 500), // 500ms debounce time
        [] // Dependencies array - empty so it's created only once
      );
    
      // Effect to trigger search when query or type changes
      useEffect(() => {
        if (searchQuery.trim().length < 2) {
          setIsSearching(false);
          setSearchResults([]);
          return;
        }
        
        setSearchLoading(true);
        setIsSearching(true);
        debouncedSearch(searchQuery, searchType);
        
        // Cleanup function to cancel any pending debounced calls when component unmounts
        return () => {
          debouncedSearch.cancel();
        };
      }, [searchQuery, searchType, debouncedSearch]);
    
      const clearSearch = () => {
        setSearchQuery('');
        Keyboard.dismiss();
        setIsSearching(false);
        setSearchResults([]);
      };

      const getItemTitle = (item: Movie | TVShow): string => {
        return 'title' in item ? item.title : item.name;
      };

      const handleSearchTypeChange = (type: 'movie' | 'tv') => {
        setSearchType(type);
        // Clear previous search results when changing type
        setSearchResults([]);
        // If there's a search query, immediately search with the new type
        if (searchQuery.trim().length >= 2) {
          setSearchLoading(true);
          debouncedSearch(searchQuery, type);
        }
      };
    
      if (initialLoading) {
        return (
          <View>
            <ActivityIndicator size="large" />
            <Text style={styles.loadingText}>Loading content...</Text>
          </View>
        );
      }
    
      if (error) {
        return (
          <View>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        );
      }
    
      const renderCategory = ({ item }: { item: MediaCategory }) => (
        <View style={styles.categoryContainer}>
          <Text style={styles.categoryTitle}>{item.title}</Text>
          <FlatList 
            data={item.data}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item: media }) => (
              <TouchableOpacity 
                style={styles.mediaContainer}
                onPress={() => {
                  if (item.type === 'movie') {
                    handleMoviePress(media.id);
                  } else {
                    handleShowPress(media.id);
                  }
                }}
              >
                <Image
                  source={{ uri: image500(media.poster_path) || undefined }}
                  style={styles.posterImage}
                  resizeMode="cover"
                />
                <Text style={styles.mediaTitle}>{getItemTitle(media)}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => `${item.id}-${getItemTitle(item)}`}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={styles.listContent}
          />
        </View>
      );
    
      const renderSearchResult = ({ item }: { item: Movie | TVShow }) => (
        <TouchableOpacity 
          style={styles.searchResultItem}
          onPress={() => {
            if (searchType === 'movie') {
              handleMoviePress(item.id);
            } else {
              handleShowPress(item.id);
            }
          }}
        >
          <Image
            source={{ uri: image500(item.poster_path) || undefined }}
            style={styles.posterImage}
            resizeMode="cover"
          />
          <Text style={styles.mediaTitle}>{getItemTitle(item)}</Text>
        </TouchableOpacity>
      );

  return (
    <View style={styles.container}>
      <ImageBackground 
        source={require('../../assets/images/bg.jpg')}
        style={styles.contentContainer}
        imageStyle={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.headerContainer}>
          <Image
            source={require('../../assets/images/icon.png')}
            style={styles.iconImage}
          />
        </View>
        
        <View style={styles.mainContent}>
          <View style={styles.searchTypeContainer}>
            <TouchableOpacity 
              style={[styles.searchTypeButton, searchType === 'movie' ? styles.activeSearchType : {}]}
              onPress={() => handleSearchTypeChange('movie')}
            >
              <Text style={[styles.searchTypeText, searchType === 'movie' ? styles.activeSearchTypeText : {}]}>Movies</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.searchTypeButton, searchType === 'tv' ? styles.activeSearchType : {}]}
              onPress={() => handleSearchTypeChange('tv')}
            >
              <Text style={[styles.searchTypeText, searchType === 'tv' ? styles.activeSearchTypeText : {}]}>TV Shows</Text>
            </TouchableOpacity> 
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder={`Search ${searchType === 'movie' ? 'movies' : 'TV shows'}...`}
              placeholderTextColor="white"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
            />
            {searchQuery.length > 0 ? (
              <TouchableOpacity onPress={clearSearch} style={styles.searchIcon}>
                <Icon name="close" size={24} color="white" />
              </TouchableOpacity>
            ) : (
              <View style={styles.searchIcon}>
                <Icon name="movie-search-outline" size={24} color="white" />
              </View>
            )}
          </View>

          {isSearching ? (
            <>
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsText}>
                  {searchLoading 
                    ? `Searching for "${searchQuery}"...` 
                    : searchResults.length > 0 
                      ? `${searchType === 'movie' ? 'Movie' : 'TV Show'} results for "${searchQuery}"`
                      : `No ${searchType === 'movie' ? 'movies' : 'TV shows'} found for "${searchQuery}"`}
                </Text>
                {searchLoading && <ActivityIndicator size="small" style={styles.searchSpinner} />}
              </View>
              <FlatList
                data={searchResults}
                renderItem={renderSearchResult}
                keyExtractor={(item) => `search-${item.id}`}
                numColumns={2}
                contentContainerStyle={styles.searchResultsContainer}
                columnWrapperStyle={styles.searchResultsRow}
                ItemSeparatorComponent={() => <View style={styles.verticalSeparator} />}
                ListEmptyComponent={
                  !searchLoading && searchQuery.trim().length >= 2 ? (
                    <View style={styles.noResultsContainer}>
                      <Icon name="movie-search-outline" size={48} color="white" />
                      <Text style={styles.noResultsText}>
                        No {searchType === 'movie' ? 'movies' : 'TV shows'} found
                      </Text>
                    </View>
                  ) : null
                }
              />
            </>
          ) : (
            <FlatList
              data={categories}
              renderItem={renderCategory}
              keyExtractor={(item) => item.title}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={styles.categorySeparator} />}
            />
          )}
        </View>
      </ImageBackground>
    </View>
  )
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    height: height,
  },
  contentContainer: {
    flex: 1,
    width: width,
    height: height,
  },
  headerContainer: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 8,
  },
  iconImage: {
    width: 100,
    height: 100,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  searchTypeText: {
    color: 'white',
  },
  categorySeparator: {
    height: 24, // Space between categories
  },
  backgroundImage: {
    width: width,
    height: height,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  categoryContainer: {
    marginVertical: 16,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    marginLeft: 8,
  },
  mediaContainer: {
    marginHorizontal: 8,
    alignItems: 'center',
    width: 120,
  },
  searchResultItem: {
    marginHorizontal: 8,
    marginVertical: 10,
    alignItems: 'center',
    width: 120,
  },
  posterImage: {
    width: 120,
    height: 180,
    borderRadius: 8,
  },
  mediaTitle: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
    color: '#fff',
    width: '100%',
  },
  separator: {
    width: 16,
  },
  listContent: {
    paddingHorizontal: 8,
  },
  searchTypeContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  searchTypeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeSearchType: {
    backgroundColor: '#0066cc',
    
  },
  activeSearchTypeText: {
    fontWeight: 'bold',
    color: 'white',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 50,
    borderColor: 'white',
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: 'white',
  },
  searchIcon: {
    padding: 8,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultsText: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  searchSpinner: {
    marginLeft: 8,
  },
  searchResultsContainer: {
    paddingBottom: 16,
    flexGrow: 1,
  },
  searchResultsRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  verticalSeparator: {
    height: 16, // Space between vertical rows in search results
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  noResultsText: {
    marginTop: 16,
    fontSize: 16,
  }
})

export default discover
