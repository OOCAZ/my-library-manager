import {
  Image,
  StyleSheet,
  Platform,
  View,
  Button,
  TouchableOpacity,
  Text,
  Modal,
  TextInput,
} from "react-native";

import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import {
  BarcodeScanningResult,
  BarcodeType,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HomeScreen() {
  const [facing, setFacing] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [sureAdd, setSureAdd] = useState(false);
  const [alreadyAdded, setAlreadyAdded] = useState(false);
  const [isbnEntry, setIsbnEntry] = useState("");
  const [errorFetching, setErrorFetching] = useState(false);
  const [selectedBook, setSelectedBook] = useState(
    undefined as BarcodeScanningResult | undefined
  );
  const [bookInfo, setBookInfo] = useState(undefined as any | undefined);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  async function addBookToLibrary() {
    try {
      if (await AsyncStorage.getItem("libraryBooks")) {
        const books = JSON.parse(
          (await AsyncStorage.getItem("libraryBooks")) || ""
        );
        if (
          books.find(
            (book: any) =>
              book.items[0].volumeInfo.title ===
              bookInfo.items[0].volumeInfo.title
          )
        ) {
          setSureAdd(false);
          setAlreadyAdded(true);
          return;
        }
        books.push(bookInfo);
        AsyncStorage.setItem("libraryBooks", JSON.stringify(books));
      } else {
        AsyncStorage.setItem("libraryBooks", JSON.stringify([bookInfo]));
      }
    } catch (e) {
      console.error(e);
    }
    setSureAdd(false);
  }

  async function checkInLibrary() {
    try {
      if (await AsyncStorage.getItem("libraryBooks")) {
        const books = JSON.parse(
          (await AsyncStorage.getItem("libraryBooks")) || ""
        );
        if (
          books.find(
            (book: any) =>
              book.items[0].volumeInfo.title ===
              bookInfo.items[0].volumeInfo.title
          )
        ) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  function fetchBookInfo(data: BarcodeScanningResult) {
    try{
      fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${data.data}`)
      .then((response) => response.json())
      .then((data) => {
        if(data.totalItems === 0){
          setErrorFetching(true);
          return;
        }
        setBookInfo(data);
        console.log(data);
      }).catch((e) => {
        setErrorFetching(true);
        console.error(e);
      });
    } catch (e) {
      setErrorFetching(true);
      console.error(e);
    }
    
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }
  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        barcodeScannerSettings={{
          barcodeTypes: ["ean13"],
        }}
        onBarcodeScanned={(data) => {
          setSureAdd(true);
          setSelectedBook(data);
          fetchBookInfo(data);
          console.log(data);
        }}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={toggleCameraFacing}>
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity>
          <TextInput
            style={{ color: "white", marginLeft: 20, marginRight: 20 }}
            value={isbnEntry}
            placeholderTextColor="white"
            placeholder="Or just type an isbn here..."
            onChangeText={setIsbnEntry}
          />
          <TouchableOpacity
            onPress={() => {
              let data = {
                data: isbnEntry,
              } as BarcodeScanningResult;
              setSureAdd(true);
              setSelectedBook(data);
              fetchBookInfo(data);
              console.log(data);
            }}
          >
            <Text style={styles.text}>Submit ISBN</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
      <Modal visible={sureAdd}>
        <View>
          {bookInfo ? (
            <Text>Title: {bookInfo.items[0].volumeInfo.title}</Text>
          ) : null}
          <Text>Are you sure you want to add this book?</Text>
          <Button
            title="Yes"
            onPress={async () => {
              console.log(checkInLibrary());
              addBookToLibrary();
            }}
          />
          <Button
            title="No"
            onPress={() => {
              setSureAdd(false);
              setSelectedBook(undefined);
              setBookInfo(undefined);
            }}
          />
        </View>
      </Modal>
      <Modal visible={alreadyAdded}>
        <View>
          <Text>You have already added this book to your library</Text>
          <Button
            title="Cancel"
            onPress={() => {
              setAlreadyAdded(false);
              setSelectedBook(undefined);
              setBookInfo(undefined);
            }}
          />
        </View>
      </Modal>
      <Modal visible={errorFetching}>
        <View>
          <Text>Could not get ISBN. Please try again.</Text>
          <Button
            title="Continue"
            onPress={() => {
              setErrorFetching(false);
              setSureAdd(false);
              setSelectedBook(undefined);
              setBookInfo(undefined);
            }}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  container: {
    flex: 1,
    justifyContent: "center",
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "column",
    position: "absolute",
    bottom: "10%",
    left: "20%",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    width: "60%",
    height: "10%",
    color: "white",
  },
  viewContainer: {
    flex: 1,
    backgroundColor: "transparent",
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 20,
    marginTop: 200,
    color: "white",
    flexDirection: "column",
  },
  button: {
    flex: 1,
    alignSelf: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    alignSelf: "center",
  },
});
