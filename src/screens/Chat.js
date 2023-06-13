import React, {
    useState,
    useEffect,
    useLayoutEffect,
    useCallback
  } from 'react';
  import { TouchableOpacity, Text, Image, View, StyleSheet } from 'react-native';
  import { GiftedChat, InputToolbar, Send, Bubble } from 'react-native-gifted-chat';
  import {
    collection,
    addDoc,
    orderBy,
    query,
    onSnapshot,
    Timestamp
  } from 'firebase/firestore';
  import { auth, database } from '../../config/firebase';
  import { useNavigation } from '@react-navigation/native';


export default function Chat({route}) {

    const [messages, setMessages] = useState([]);
    const navigation = useNavigation();
    const { uid, email, username, image} = route.params;

  useLayoutEffect(() => {
      navigation.setOptions({
          // headerStyle:{
          //   shadowColor: 'grey',
          //   shadowOpacity: .9,
          //   shadowRadius: 8,
          // },
          headerTitle: props => 
              <View style={styles.userBox}>
                <Image source={{uri: image}} style={styles.userImg} />
                <Text style={styles.userName}>{username}</Text>
              </View>
          ,
          // headerTitleStyle: { 
          //     color: 'black',
          //     fontSize: 24,
          //     marginLeft: 10,
          // },
          headerTitleAlign: 'center',
      });
  }, [navigation]);

  const customtInputToolbar = (props) => {
    return (
      <InputToolbar
        {...props}
        containerStyle={{
        backgroundColor: "white",
        padding: 8
      }}
    />
    );
  };

  const customSend = (props) => {
    return (
      <Send
        {...props}
        containerStyle={{
        backgroundColor: "white",
        color: 'blue',
        }} 
      />
    );
  }

  useEffect(() => {
    const userId = auth?.currentUser?.uid;
    const idRef = userId > uid ? `${userId + uid}` : `${uid + userId}`;
    const collectionRef = collection(database, 'messages', idRef, 'chat');
    const q = query(collectionRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
            let msgs = [];
            querySnapshot.docs.map((doc) => {
              const data = doc.data()
              if(data.createdAt){
                 msgs.push({
                    ...data,
                    createdAt: data.createdAt.toDate(),
                });
             }
             else {
                msgs.push({
                    ...data,
                    createdAt:new Date(),
                });
             }
            })
            setMessages(msgs)
          });
      return unsubscribe;
  }, []);

    const onSend = async (messageArray) => {
        const userId = auth?.currentUser?.uid;
        const text = messageArray[0];
        const myMsg = {
          ...text,
          from : userId,
          to: uid,
          createdAt: new Date(),
        }  
        const idRef = userId > uid ? `${userId + uid}` : `${uid + userId}`;
        console.log(idRef);
        setMessages(previousMessages =>
          GiftedChat.append(previousMessages, myMsg)
        );
         
        await addDoc(collection(database, 'messages', idRef , "chat"), {
          ...myMsg,
          createdAt: Timestamp.fromDate(new Date),
        });
      }

      return (
        <GiftedChat
          messages={messages}
          showAvatarForEveryMessage={true}
          onSend={text => onSend(text)}
          messagesContainerStyle={{
            backgroundColor: '#fff',
            paddingBottom: 20
          }}
          textInputStyle={{
            backgroundColor: 'white',
            fontSize: 20,
          }}
          user={{
            _id: auth?.currentUser?.uid,
          }}
          renderInputToolbar={customtInputToolbar}
          renderSend={customSend}
        />
      );
}

const styles = StyleSheet.create({
  userBox:{
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
},
  userImg:{
    borderRadius: 100,
    height: 50,
    width: 50,
    margin: 10,
},
userName:{
    color: 'black',
    fontWeight: 600,
    fontSize: 20,
    marginLeft: 10,
},
});