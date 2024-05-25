import {
  Image,
  StyleSheet,
  Platform,
  View,
  Button,
  TouchableOpacity,
  Text,
  Modal,
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

  function fetchBookInfo(data: BarcodeScanningResult) {
    fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${data.data}`)
      .then((response) => response.json())
      .then((data) => {
        setBookInfo(data);
        console.log(data);
      });
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
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
      <Modal visible={sureAdd}>
        <View>
          {bookInfo ? (
            <Text>Title: {bookInfo.items[0].volumeInfo.title}</Text>
          ) : null}
          <Text>Are you sure you want to add this book?</Text>
          <Button title="Yes" onPress={() => addBookToLibrary()} />
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
    flexDirection: "row",
    backgroundColor: "transparent",
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
});
