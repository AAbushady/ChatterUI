import TextBoxModal from '@components/TextBoxModal'
import { FontAwesome } from '@expo/vector-icons'
import { Global, Color, Users, Logger } from '@globals'
import { Stack, useRouter } from 'expo-router'
import { useState, useEffect } from 'react'
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    Alert,
} from 'react-native'
import { useMMKVString } from 'react-native-mmkv'

const UserSelector = () => {
    const router = useRouter()

    const [userName, setUserName] = useMMKVString(Global.CurrentUser)
    const [userCard, setUserCard] = useMMKVString(Global.CurrentUserCard)
    const [userList, setUserList] = useState([])
    const [showNewUser, setShowNewUser] = useState(false)

    const loadUserList = () => {
        Users.getFileList()
            .then((response) => {
                if (response.length === 0) {
                    const defaultName = 'User'
                    Users.createUser(defaultName).then(() => {
                        setUserName(defaultName)
                        Users.loadFile(defaultName).then((card) => setUserCard(card))
                        setUserList([defaultName])
                    })
                    return
                }
                setUserList(response)
                const cleanlist = response.map((item) => item.replace('.json', ''))
                if (cleanlist.includes(userName)) return
                setUserName(cleanlist[0])
                Users.loadFile(cleanlist[0]).then((card) => setUserCard(card))
            })
            .catch(() => setUserList([]))
    }

    useEffect(() => {
        if (userName !== undefined) loadUserList()
    }, [])

    return (
        <SafeAreaView style={styles.mainContainer}>
            <Stack.Screen
                options={{
                    title: 'Personas',
                    animation: 'slide_from_left',
                    headerRight: () => {
                        return (
                            <View>
                                <TouchableOpacity
                                    onPress={() => {
                                        setShowNewUser(true)
                                    }}>
                                    <FontAwesome size={28} name="plus" color={Color.Button} />
                                </TouchableOpacity>
                            </View>
                        )
                    },
                }}
            />

            <ScrollView>
                {userList.map((name, index) => (
                    <View
                        key={index}
                        style={
                            name === userName
                                ? { ...styles.useritem, backgroundColor: Color.Container }
                                : styles.useritem
                        }>
                        <TouchableOpacity
                            style={styles.useritembutton}
                            onPress={() => {
                                Users.loadFile(name).then((file) => {
                                    setUserCard(file)
                                    setUserName(name)
                                    router.back()
                                })
                            }}>
                            <Image
                                source={{ uri: Users.getImageDir(name) }}
                                loadingIndicatorSource={require('@assets/user.png')}
                                style={styles.avatar}
                            />

                            <Text style={{ flex: 1, color: Color.Text }}>{name}</Text>

                            <TouchableOpacity
                                onPress={() => {
                                    Alert.alert(
                                        `Delete Persona`,
                                        `Are you sure you want to delete '${name}'?`,
                                        [
                                            { text: `Cancel`, style: `cancel` },
                                            {
                                                text: `Confirm`,
                                                style: `destructive`,
                                                onPress: () =>
                                                    Users.deleteFile(name).then(() => {
                                                        loadUserList()
                                                    }),
                                            },
                                        ]
                                    )
                                }}>
                                <FontAwesome size={28} name="trash" color={Color.Button} />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>

            <TextBoxModal
                booleans={[showNewUser, setShowNewUser]}
                onConfirm={(text) => {
                    if (userList.includes(text)) {
                        Logger.log(`Persona Already Exists`, true)
                        return
                    }
                    Users.createUser(text)
                        .then(async () => {
                            return Users.loadFile(text)
                        })
                        .then((card) => {
                            setUserName(text)
                            setUserCard(card)
                            router.back()
                        })
                }}
            />
        </SafeAreaView>
    )
}

export default UserSelector

const styles = StyleSheet.create({
    mainContainer: {
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: Color.Background,
        flex: 1,
    },

    avatar: {
        width: 48,
        height: 48,
        marginRight: 8,
        borderRadius: 24,
    },

    username: {
        marginLeft: 8,
    },

    useritem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: Color.DarkContainer,
    },

    useritembutton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
})
