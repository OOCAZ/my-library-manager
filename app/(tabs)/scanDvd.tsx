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
import { router } from "expo-router";
import React from "react";

export default function ScanScreen() {
  const [facing, setFacing] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [sureAdd, setSureAdd] = useState(false);
  const [alreadyAdded, setAlreadyAdded] = useState(false);
  const [isbnEntry, setIsbnEntry] = useState("");
  const [errorFetching, setErrorFetching] = useState(false);
  const [selectedBook, setSelectedBook] = useState(
    undefined as BarcodeScanningResult | undefined
  );
  const [dvdInfo, setDvdInfo] = useState(undefined as any | undefined);
  const [barcodeFound, setBarcodeFound] = useState(false);
  const [debounced, setDebounced] = useState(false);

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

  async function addDvdToLibrary() {
    try {
      if (await AsyncStorage.getItem("libraryDvds")) {
        const dvds = JSON.parse(
          (await AsyncStorage.getItem("libraryDvds")) || ""
        );
        if (
          dvds.find((dvd: any) => dvd.items[0].title === dvdInfo.items[0].title)
        ) {
          setSureAdd(false);
          setAlreadyAdded(true);
          return;
        }
        dvds.push(dvdInfo);
        AsyncStorage.setItem("libraryDvds", JSON.stringify(dvds));
      } else {
        AsyncStorage.setItem("libraryDvds", JSON.stringify([dvdInfo]));
      }
    } catch (e) {
      console.error(e);
    }
    setSureAdd(false);
    setBarcodeFound(false);
  }

  async function checkInLibrary() {
    try {
      if (await AsyncStorage.getItem("libraryDvds")) {
        const dvds = JSON.parse(
          (await AsyncStorage.getItem("libraryDvds")) || ""
        );
        if (
          dvds.find((dvd: any) => dvd.items[0].title === dvdInfo.items[0].title)
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

  function fetchDvdInfo(data: BarcodeScanningResult) {
    try {
      fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${data.data}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.total === 0) {
            setErrorFetching(true);
            return;
          }
          setDvdInfo(data);
          console.log(data);
        })
        .catch((e) => {
          setErrorFetching(true);
          console.error(e);
        });
    } catch (e) {
      setErrorFetching(true);
      console.error(e);
    }
  }

  // Handle barcode scanned with debounce
  const handleBarCodeScanned = (
    data: React.SetStateAction<BarcodeScanningResult | undefined>
  ) => {
    if (!debounced) {
      // Check debounce state
      setBarcodeFound(true);
      setSelectedBook(data);
      fetchDvdInfo(data as BarcodeScanningResult);
      setSureAdd(true);
      console.log("Scanned data:", data);

      // Start debounce timer to prevent multiple scans
      setDebounced(true);
      setTimeout(() => {
        setDebounced(false);
      }, 2000); // 2-second delay
    }
  };

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }
  return (
    <View style={styles.container}>
      {barcodeFound ? (
        <></>
      ) : (
        <CameraView
          style={styles.camera}
          barcodeScannerSettings={{
            barcodeTypes: ["ean13"],
          }}
          onBarcodeScanned={(data: BarcodeScanningResult) => {
            if (data) {
              handleBarCodeScanned(data);
            }
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
                fetchDvdInfo(data);
                console.log("Data", data);
              }}
            >
              <Text style={styles.text}>Submit ISBN</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      )}

      <Modal visible={sureAdd}>
        <View>
          {dvdInfo ? <Text>Title: {dvdInfo.items[0].title}</Text> : null}
          <Text>Are you sure you want to add this Dvd?</Text>
          <Button
            title="Yes"
            onPress={async () => {
              console.log(checkInLibrary());
              addDvdToLibrary();
            }}
          />
          <Button
            title="No"
            onPress={() => {
              setSureAdd(false);
              setSelectedBook(undefined);
              setDvdInfo(undefined);
              setBarcodeFound(false);
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
              setDvdInfo(undefined);
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
              setDvdInfo(undefined);
              setBarcodeFound(false);
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
