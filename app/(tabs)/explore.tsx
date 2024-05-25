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
import { useState } from "react";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function TabTwoScreen() {
  const [bookList, setBookList] = useState([]);
  const [gotBooks, setGotBooks] = useState(false);

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
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={
        <Ionicons size={310} name="code-slash" style={styles.headerImage} />
      }
    >
      <ScrollView style={{ flex: 1, flexDirection: "column" }}>
        <Button title="Get Books" onPress={getBooks} />
        <Button title="Reset Books" onPress={resetBooks} />
        {gotBooks ? (
          <View style={{ flex: 1, flexDirection: "column" }}>
            <ThemedText style={{ fontSize: 24 }}>Books:</ThemedText>
            {bookList.map((book: any) => (
              <Collapsible
                key={book.items[0].volumeInfo.authors[0]}
                title={book.items[0].volumeInfo.title}
              >
                <ThemedText>{book.items[0].volumeInfo.authors[0]}</ThemedText>
                <ExternalLink href={book.items[0].volumeInfo.previewLink}>
                  {book.items[0].volumeInfo.previewLink}
                </ExternalLink>
              </Collapsible>
            ))}
          </View>
        ) : (
          <ThemedText style={{ fontSize: 24 }}>
            No books yet, press the button or start scanning
          </ThemedText>
        )}
        <ThemedText>
          All Info is courtesy of the Google Books API Family, thanks papa G!
        </ThemedText>
      </ScrollView>
    </ParallaxScrollView>
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
});
