import CheckboxTitle from '@components/CheckboxTitle'
import TextBox from '@components/TextBox'
import TextBoxModal from '@components/TextBoxModal'
import { FontAwesome } from '@expo/vector-icons'
import { Global, Color, Instructs, saveStringExternal, Logger } from '@globals'
import { Stack } from 'expo-router'
import { useState, useEffect } from 'react'
import { View, SafeAreaView, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native'
import { Dropdown } from 'react-native-element-dropdown'
import { useMMKVObject, useMMKVString } from 'react-native-mmkv'

const Instruct = () => {
    const [instructName, setInstructName] = useMMKVString(Global.InstructName)
    const [currentInstruct, setCurrentInstruct] = useMMKVObject(Global.CurrentInstruct)
    const [instructList, setInstructList] = useState([])
    const [selectedItem, setSelectedItem] = useState(null)
    const [showNewInstruct, setShowNewInstruct] = useState(false)

    const loadInstructList = (name) => {
        Instructs.getFileList().then((list) => {
            const mainlist = list.map((item, index) => {
                return { label: item.replace(`.json`, ''), value: index }
            })
            setInstructList(mainlist)
            for (const item of mainlist) {
                if (item.label.replace(`.json`, '') === name) {
                    setSelectedItem(item.value)
                    return
                }
            }
            setSelectedItem(0)
            Instructs.loadFile(list[0].replace(`.json`, '')).then((instruct) => {
                setCurrentInstruct(JSON.parse(instruct))
            })
        })
    }

    useEffect(() => {
        loadInstructList(instructName)
    }, [])

    return (
        <SafeAreaView style={styles.mainContainer}>
            <Stack.Screen
                options={{
                    title: `Instruct`,
                    animation: 'slide_from_left',
                }}
            />

            <TextBoxModal
                booleans={[showNewInstruct, setShowNewInstruct]}
                onConfirm={(text) => {
                    if (instructList.some((item) => item.label === text)) {
                        Logger.log(`Preset name already exists.`, true)
                        return
                    }

                    Instructs.saveFile(text, { ...currentInstruct, name: text }).then(() => {
                        Logger.log(`Preset created.`, true)
                        setInstructName(text)
                        loadInstructList(text)
                    })
                }}
            />

            <View style={styles.dropdownContainer}>
                <Dropdown
                    value={selectedItem}
                    style={styles.dropdownbox}
                    data={instructList}
                    selectedTextStyle={styles.selected}
                    labelField="label"
                    valueField="value"
                    onChange={(item) => {
                        if (item.label === instructName) return

                        setInstructName(item.label)
                        Instructs.loadFile(item.label).then((preset) => {
                            setCurrentInstruct(JSON.parse(preset))
                        })
                    }}
                />
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                        Instructs.saveFile(instructName, currentInstruct).then(
                            Logger.log(`Preset Updated!`, true)
                        )
                    }}>
                    <FontAwesome size={24} name="save" color={Color.Button} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                        if (instructList.length === 1) {
                            Logger.log(`Cannot delete last Instruct preset.`, true)
                            return
                        }
                        Alert.alert(
                            `Delete Preset`,
                            `Are you sure you want to delete  '${instructName}'?`,
                            [
                                { text: `Cancel`, style: `cancel` },
                                {
                                    text: `Confirm`,
                                    style: `destructive`,
                                    onPress: () => {
                                        Instructs.deleteFile(instructName).then(() => {
                                            loadInstructList()
                                        })
                                    },
                                },
                            ]
                        )
                    }}>
                    <FontAwesome size={24} name="trash" color={Color.Button} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                        Instructs.uploadFile().then((name) => {
                            if (name === undefined) {
                                return
                            }
                            Instructs.loadFile(name).then((instruct) => {
                                setCurrentInstruct(JSON.parse(instruct))
                                setInstructName(name)
                                loadInstructList(name)
                            })
                        })
                    }}>
                    <FontAwesome size={24} name="upload" color={Color.Button} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.button}
                    onPress={async () => {
                        saveStringExternal(instructName, JSON.stringify(currentInstruct))
                    }}>
                    <FontAwesome size={24} name="download" color={Color.Button} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                        setShowNewInstruct(true)
                    }}>
                    <FontAwesome size={24} name="plus" color={Color.Button} />
                </TouchableOpacity>
            </View>

            <ScrollView>
                <View
                    style={{
                        paddingVertical: 20,
                        paddingHorizontal: 16,
                        paddingBottom: 150,
                    }}>
                    <TextBox
                        name="System Sequence"
                        varname="system_prompt"
                        lines={3}
                        body={currentInstruct}
                        setValue={setCurrentInstruct}
                        multiline
                    />

                    <View style={{ flexDirection: 'row' }}>
                        <TextBox
                            name="Input Sequence"
                            varname="input_sequence"
                            body={currentInstruct}
                            setValue={setCurrentInstruct}
                            multiline
                        />
                        <TextBox
                            name="Output Sequence"
                            varname="output_sequence"
                            body={currentInstruct}
                            setValue={setCurrentInstruct}
                            multiline
                        />
                    </View>

                    {/* Unused Sequences
                    <View style={{ flexDirection: 'row' }}>
                        <TextBox
                            name="First Output Sequence"
                            varname="first_output_sequence"
                            body={currentInstruct}
                            setValue={setCurrentInstruct}
                            multiline
                        />
                        <TextBox
                            name="Last Output Sequence"
                            varname="last_output_sequence"
                            body={currentInstruct}
                            setValue={setCurrentInstruct}
                            multiline
                        />
                    </View>
                    */}

                    <View style={{ flexDirection: 'row' }}>
                        <TextBox
                            name="System Sequence Prefix"
                            varname="system_sequence_prefix"
                            body={currentInstruct}
                            setValue={setCurrentInstruct}
                            multiline
                        />
                        <TextBox
                            name="System Sequence Suffix"
                            varname="system_sequence_suffix"
                            body={currentInstruct}
                            setValue={setCurrentInstruct}
                            multiline
                        />
                    </View>

                    <View style={{ flexDirection: 'row' }}>
                        <TextBox
                            name="Stop Sequence"
                            varname="stop_sequence"
                            body={currentInstruct}
                            setValue={setCurrentInstruct}
                            multiline
                        />
                        <TextBox
                            name="Seperator Sequence"
                            varname="separator_sequence"
                            body={currentInstruct}
                            setValue={setCurrentInstruct}
                            multiline
                        />
                    </View>

                    <CheckboxTitle
                        name="Wrap Sequence with Newline"
                        varname="wrap"
                        body={currentInstruct}
                        setValue={setCurrentInstruct}
                    />

                    {/* @TODO: Macros are always replaced - people may want this to be changed
                    <CheckboxTitle
                        name="Replace Macro In Sequences"
                        varname="macro"
                        body={currentInstruct}
                        setValue={setCurrentInstruct}
                    />
                    */}

                    <CheckboxTitle
                        name="Include Names"
                        varname="names"
                        body={currentInstruct}
                        setValue={setCurrentInstruct}
                    />

                    {/*  Groups are not implemented - leftover from ST
                    <CheckboxTitle
                        name="Force for Groups and Personas"
                        varname="names_force_groups"
                        body={currentInstruct}
                        setValue={setCurrentInstruct}
                    />
                    */}

                    <TextBox
                        name="Activation Regex"
                        varname="activation_regex"
                        body={currentInstruct}
                        setValue={setCurrentInstruct}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default Instruct

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Color.Background,
    },

    dropdownContainer: {
        marginHorizontal: 16,
        marginTop: 16,
        flexDirection: 'row',
        paddingBottom: 12,
        alignItems: 'center',
    },

    dropdownbox: {
        flex: 1,
        paddingHorizontal: 8,
        backgroundColor: Color.DarkContainer,
        borderRadius: 8,
    },

    selected: {
        color: Color.Text,
    },

    button: {
        padding: 5,
        backgroundColor: Color.DarkContainer,
        borderRadius: 4,
        marginLeft: 8,
    },
})
