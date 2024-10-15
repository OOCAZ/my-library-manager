import Ionicons from "@expo/vector-icons/Ionicons";
import {
  StyleSheet,
  Image,
  Platform,
  Button,
  View,
  ScrollView,
  Text,
} from "react-native";

import { Collapsible } from "@/components/Collapsible";
import { ExternalLink } from "@/components/ExternalLink";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useEffect, useState } from "react";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { Searchbar } from "react-native-paper";

export default function HomeScreen() {
  const [bookList, setBookList] = useState([]);
  const [gotBooks, setGotBooks] = useState(false);
  const [gotDvds, setGotDvds] = useState(false);
  const [dvdList, setDvdList] = useState([]);
  const [searchBooksQuery, setBooksSearchQuery] = React.useState("");
  const [searchDvdsQuery, setDvdsSearchQuery] = React.useState("");
  const [areSearchingBooks, setAreSearchingBooks] = React.useState(false);
  const [areSearchingDvds, setAreSearchingDvds] = React.useState(false);
  const [tempBookList, setTempBookList] = useState([]);

  useEffect(() => {
    getBooks();
    getDvds();
  }, []);

  const getBooks = async () => {
    try {
      const books = await AsyncStorage.getItem("libraryBooks");
      setBookList(JSON.parse(books as string));
      console.log(books);
      if (books) {
        setGotBooks(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getDvds = async () => {
    try {
      const dvds = await AsyncStorage.getItem("libraryDvds");
      setDvdList(JSON.parse(dvds as string));
      console.log(dvds);
      if (dvds) {
        setGotDvds(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const resetBooks = async () => {
    try {
      await AsyncStorage.removeItem("libraryBooks");
      setGotBooks(false);
      setBookList([]);
    } catch (error) {
      console.error(error);
    }
  };

  const resetDvds = async () => {
    try {
      await AsyncStorage.removeItem("libraryDvds");
      setGotDvds(false);
      setDvdList([]);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <ScrollView style={{ flex: 1, flexDirection: "column", marginTop: "10%" }}>
      <ThemedView style={styles.buttonContainer}>
        <Button title="Get Books" onPress={getBooks} />
        <Button title="Reset Books" onPress={resetBooks} />
      </ThemedView>
      {gotBooks || gotDvds ? (
        <>
          <View style={styles.buttonContainer}>
            <Searchbar
              placeholder="Search Books"
              onChangeText={setBooksSearchQuery}
              value={searchBooksQuery}
              onChange={() => {
                if (searchBooksQuery.length > 0) {
                  setAreSearchingBooks(true);
                } else {
                  setAreSearchingBooks(false);
                }
              }}
            />
            {gotBooks && areSearchingBooks ? (
              <>
                <ThemedText>Results: </ThemedText>
              </>
            ) : (
              <></>
            )}
            <Collapsible title="Books">
              {bookList.map((book: any) => (
                <Collapsible
                  key={book.items[0].volumeInfo.title}
                  title={book.items[0].volumeInfo.title}
                >
                  {book.items[0].volumeInfo.authors.map(
                    (i: string | number) => {
                      return (
                        <ThemedText key={book.items[0].volumeInfo.authors[i]}>
                          {book.items[0].volumeInfo.authors[i]}
                        </ThemedText>
                      );
                    }
                  )}
                  <ThemedText>{book.items[0].volumeInfo.authors[0]}</ThemedText>
                  <ExternalLink href={book.items[0].volumeInfo.previewLink}>
                    <ThemedText>
                      {book.items[0].volumeInfo.previewLink}
                    </ThemedText>
                  </ExternalLink>
                </Collapsible>
              ))}
            </Collapsible>
          </View>
          <ThemedView style={styles.buttonContainer}>
            <Button title="Get DVDs" onPress={getDvds} />
            <Button title="Reset DVDs" onPress={resetDvds} />
          </ThemedView>
          <View style={styles.buttonContainer}>
            <Searchbar
              placeholder="Search DVDs"
              onChangeText={setDvdsSearchQuery}
              value={searchDvdsQuery}
              onChange={() => {
                if (searchDvdsQuery.length > 0) {
                  setAreSearchingDvds(true);
                } else {
                  setAreSearchingDvds(false);
                }
              }}
            />
            {gotDvds && areSearchingDvds ? <></> : <></>}
            <Collapsible title="DVDs">
              {dvdList.map((dvd: any) => (
                <Collapsible
                  key={dvd.items[0].title}
                  title={dvd.items[0].title}
                >
                  <ThemedText>{dvd.items[0].description}</ThemedText>
                  <ExternalLink href={dvd.items[0].offers[0]?.link}>
                    <ThemedText>{dvd.items[0].offers[0]?.link}</ThemedText>
                  </ExternalLink>
                </Collapsible>
              ))}
            </Collapsible>
          </View>
        </>
      ) : (
        <ThemedText style={{ fontSize: 24 }}>
          No books or DVDs yet, press the button or start scanning
        </ThemedText>
      )}
      <View style={styles.buttonContainer}>
        <ThemedText>
          All Info is courtesy of the Google Books API Family, thanks papa G!
        </ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
  buttonContainer: {
    margin: 50,
  },
});
