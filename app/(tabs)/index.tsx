import Ionicons from "@expo/vector-icons/Ionicons";
import {
  StyleSheet,
  Image,
  Platform,
  Button,
  View,
  ScrollView,
} from "react-native";

import { Collapsible } from "@/components/Collapsible";
import { ExternalLink } from "@/components/ExternalLink";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useEffect, useState } from "react";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function TabTwoScreen() {
  const [bookList, setBookList] = useState([]);
  const [gotBooks, setGotBooks] = useState(false);

  useEffect(() => {
    getBooks();
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

  const resetBooks = async () => {
    try {
      await AsyncStorage.removeItem("libraryBooks");
      setGotBooks(false);
      setBookList([]);
    } catch (error) {
      console.error(error);
    }
  };
  return (
      <ScrollView style={{ flex: 1, flexDirection: "column", marginTop: "10%"}}>
        <ThemedView style={styles.buttonContainer}>
          <Button title="Get Books" onPress={getBooks} />
          <Button title="Reset Books" onPress={resetBooks} />
        </ThemedView>
        {gotBooks ? (
          <View style={styles.buttonContainer}>
            <ThemedText style={{ fontSize: 24 }}>Books:</ThemedText>
            {bookList.map((book: any) => (
              <Collapsible
                key={book.items[0].volumeInfo.title}
                title={book.items[0].volumeInfo.title}
              >
                {book.items[0].volumeInfo.authors.map((i: string | number) => {
                  return <ThemedText>{book.items[0].volumeInfo.authors[i]}</ThemedText>
                    })}
                    <ThemedText>{book.items[0].volumeInfo.authors[0]}</ThemedText>
                <ExternalLink href={book.items[0].volumeInfo.previewLink}>
                  <ThemedText>
                    {book.items[0].volumeInfo.previewLink}
                  </ThemedText>
                </ExternalLink>
              </Collapsible>
            ))}
          </View>
        ) : (
          <ThemedText style={{ fontSize: 24 }}>
            No books yet, press the button or start scanning
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

  }
});
