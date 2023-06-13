import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Image, SafeAreaView, 
  TouchableOpacity, StatusBar, Modal, Alert} from "react-native";
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, database, storage } from "../../config/firebase";
import {
  collection,
  addDoc
} from 'firebase/firestore';
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from '@react-navigation/native';
const backImage = require("../../assets/pexels.jpg");

export default function Signup() {

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [upload,setUpload] = useState(false);
  const [img,setImg] = useState('');
  const [showImgName, setShowImgName] = useState(false);
  const navigation = useNavigation();
  

  const uploadImageAsync= async () => {

        const blob = await new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function() {
          resolve(xhr.response);
        };
        xhr.responseType = 'blob';
        xhr.open('GET', img, true);
        xhr.send();
      });

      const metadata = {
        contentType: 'image/jpeg'
      };    
      const imgRef = ref(
        storage,
        'images/'+email
        );
      const snap = await uploadBytes(imgRef, blob, metadata);
      const url = await getDownloadURL(ref(storage,snap.ref.fullPath));
      return url;
  }

  const createUser = async (id) => {
    const url = await uploadImageAsync();
    const collectionRef = collection(database, 'users');
    await addDoc(collectionRef,{
      username: name,
      email: email,
      image: url,
      uid: id,
    });
  }

  const takePhoto = async () => {
    let pickerResult = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 4],
    });
    if(!pickerResult.canceled){
      setImg(pickerResult.assets[0].uri);
      setUpload(false);
      setShowImgName(true);
    }
  }

  const uploadPhoto = async () => {
    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 4],
    });
    if(!pickerResult.canceled){
      setImg(pickerResult.assets[0].uri);
      setUpload(false);
      setShowImgName(true);
    }
  }

  const onHandleSignup = async () => {
      if (name !== ' ' && email !== '' && password !== '' && img !=='') {
          createUserWithEmailAndPassword(auth, email, password)
          .then(async (userResult) => {
              await createUser(userResult.user.uid);
          })
          .catch((err) => Alert.alert("SignUp error", err.message));
      }
      else{
        Alert.alert('Error', "Please fill out the details!");
      }
  };
  
  return (
    <View style={styles.container}>
      <Image source={backImage} style={styles.backImage} />
      <View />
      <SafeAreaView style={styles.form}>
        <LinearGradient
        colors={["#6F0E0E", "#DA3C4F", "#E9B61F"]}
        style={styles.logoBg}
        ><Text style={styles.appTitle}>NxtChat</Text>
        </LinearGradient>
        <Text style={styles.title}>SIGN UP</Text>
        <TextInput
        style={styles.input}
        placeholder="Enter Username"
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry={false}
        textContentType='username'
        value={name}
        onChangeText={(text) => setName(text)}
      />
         <TextInput
        style={styles.input}
        placeholder="Enter email"
        autoCapitalize="none"
        keyboardType="email-address"
        textContentType="emailAddress"
        autoFocus={true}
        value={email}
        onChangeText={(text) => setEmail(text)}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Enter password"
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry={true}
        textContentType="password"
        value={password}
        onChangeText={(text) => setPassword(text)}
      />
      {showImgName && <Image source={{ uri: img}} style={{ width: 100, height: 100 }} />}
      <View style={{justifyContent: 'center', alignItems: 'center'}}>
        <TouchableOpacity style={styles.upload} onPress={()=>setUpload(true)}>
        <Text style={{fontWeight: '500', color: '#fff', fontSize: 16}}> Upload Image</Text>
        </TouchableOpacity>
      </View>
      <Modal
        animationType="none"
        transparent={true}
        visible={upload}
        onRequestClose={() => {
          setUpload(false);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
          <Text style={styles.modalText}>Select an option</Text>
          <TouchableOpacity
              style={[styles.modalButton, styles.buttonClose]}
              onPress={takePhoto}>
              <Text style={styles.textStyle}>Take a photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.buttonClose]}
              onPress={uploadPhoto}>
              <Text style={styles.textStyle}>Upload from gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.buttonClose]}
              onPress={() => setUpload(false)}>
              <Text style={styles.textStyle}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <TouchableOpacity style={styles.button} onPress={onHandleSignup}>
        <Text style={{fontWeight: 'bold', color: '#fff', fontSize: 18}}> SIGN UP</Text>
      </TouchableOpacity>
      <View style={{marginTop: 20, flexDirection: 'row', alignItems: 'center', alignSelf: 'center'}}>
        <Text style={{color: 'gray', fontWeight: '600', fontSize: 16}}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={{color: '#990000', fontWeight: '600', fontSize: 16}}> Log In</Text>
        </TouchableOpacity>
      </View>
      </SafeAreaView>
      <StatusBar barStyle="light-content" />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  logoBg:{
    width: 250,
    marginBottom: 20,
    alignSelf: 'center',
  },
  appTitle:{
    fontSize: 56,
    fontWeight: '900',
    color: "white",
    alignSelf: "center",
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: "#990000",
    alignSelf: "center",
    paddingBottom: 24,
  },
  input: {
    backgroundColor: "#F6F7FB",
    height: 58,
    marginBottom: 20,
    fontSize: 16,
    borderRadius: 10,
    padding: 12,
  },
  backImage: {
    width: "100%",
    height: '100%',
    position: "absolute",
    top: 0,
    resizeMode: 'cover',
  },
  whiteSheet: {
    width: '100%',
    height: '75%',
    position: "absolute",
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 60,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 30,
  },
  button: {
    backgroundColor: '#990000',
    height: 58,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  upload:{
    width: '50%',
    backgroundColor: 'orange',
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalView: {
    width: '70%',
    backgroundColor: 'white',
    borderRadius: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalButton: {
    width: '100%',
    padding: 10,
    elevation: 2,
    borderWidth: 0.2,
    borderColor: 'black', 
    height: 50, 
  },
  buttonOpen: {
    backgroundColor: 'white',
  },
  buttonClose: {
    backgroundColor: 'white',
  },
  modalText: {
    margin: 15,
    textAlign: 'center',
  },
  textStyle: {
    color: '#1a7fdb',
    fontWeight: 'bold',
    textAlign: 'center',
  },

});