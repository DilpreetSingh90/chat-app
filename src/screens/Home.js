import React, { useLayoutEffect, useEffect, useState } from "react";
import { View, TouchableOpacity, Text, Image, StyleSheet, FlatList} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
    collection,
    getDocs,
    where,
    query
  } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { database, auth } from '../../config/firebase';
import { AntDesign } from '@expo/vector-icons';

const Home = () => {

    const [users,setUsers]= useState([]);
    const navigation = useNavigation();

    const id = auth?.currentUser?.uid;

    const onSignOut = () => {
        signOut(auth).catch(error => console.log('Error logging out: ', error));
      };


    useEffect(()=>{
        const getData = async () => {
            const q = query(collection(database, "users"),where("uid","!=",id));
            const querySnapshot = await getDocs(q);
            let data=[]; 
            querySnapshot.forEach((doc) => { 
                data.push({
                    ...doc.data(),                    
                });
            });
            setUsers(data);
        }
        getData();
    },[]);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerStyle:{
                backgroundColor: '#990000',
            },
            headerTitle: 'NxtChat',
            headerTitleStyle: { 
                color: 'white',
                fontSize: 24,
                marginLeft: 10,
            },
            headerTitleAlign: 'left',
            headerRight: () => (
                <TouchableOpacity
                  style={{
                    marginRight: 10
                  }}
                  onPress={onSignOut}
                >
                  <AntDesign name="logout" size={24} color='white' style={{marginRight: 10}}/>
                </TouchableOpacity>
              )
        });
    }, [navigation]);

    const handleUser = (item) => {
        navigation.navigate("Chat",{
            uid: item.uid,
            email: item.email,
            username: item.username,
            image: item.image,
        });
    }

    return (
        <View style={styles.container}>
            <FlatList
            style={{ width:"100%"}}
            data={users}
            keyExtractor={(item,index) => index}
            renderItem={({item}) => (
            <TouchableOpacity style={styles.userBox} onPress={()=>handleUser(item)}>
                <Image source={{uri: item.image}} style={styles.userImg} />
                <Text style={styles.userName}>{item.username}</Text>
            </TouchableOpacity>
            )}
            />
        </View>
    );
    };

    export default Home;

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'flex-end',
            alignItems: 'flex-end',
            backgroundColor: "#fff",
        },
        logoBg:{
            width: '100%',
            height: 'auto',
            alignSelf: 'center',
        },
        appTitle:{
            fontSize: 30,
            fontWeight: '700',
            color: "white",
            alignSelf: "center",
        },
        userBox:{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
            borderWidth: 0.3,
            borderColor: 'black',
            shadowColor: 'grey',
            shadowOpacity: .9,
            shadowRadius: 8,
        },
        userImg:{
            borderRadius: 100,
            height: 55,
            width: 55,
            margin: 10,
        },
        userName:{
            color: 'black',
            fontWeight: 600,
            fontSize: 20,
            marginLeft: 10,
        },
    });