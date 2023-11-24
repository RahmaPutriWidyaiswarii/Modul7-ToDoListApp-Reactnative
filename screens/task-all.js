import React, { useState, useEffect } from "react";
import {
    Box,
    HStack,
    Input,
    IconButton,
    Icon,
    Center,
    Toast,
    ScrollView,
    Spinner,
} from "native-base";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TaskList } from "../components";

// state
// list: untuk menyimpan daftar tugas 
// inputvalue: menyimpan nilai dari input untuk menambahkan task baru
// is loading: yang menandakan apakah sedang dalam proses memuat data atau tidak
const TaskScreen = () => {
    const [list, setList] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    
    // Mengidentifikasi toast agar tidak muncul secara berulang jika input kosong
    const toastID = "toast-add-task";

    // Memeriksa apakah input kosong, jika iya, menampilkan toast
    const handleAddTask = (data) => {
        if (data === "") {
            if (!Toast.isActive(toastID)) {
                Toast.show({
                    id: toastID,
                    title: "Masukan nama task",
                });
            }
            return;
        }

        setList((prevList) => [...prevList, { title: data, isCompleted: false }]);
        // Mengosongkan nilai input
        setInputValue("");
        try {
            // Menyimpan data baru
            AsyncStorage.setItem(
                "@task-list",  
                // Menambahkan tugas baru ke dalam list dengan nilai default isCompleted: false.
                JSON.stringify([...list, { title: data, isCompleted: false }])
                );
            } catch (e) {
                console.log("Error add task: in task-all.js");
                console.error(e.message);
            }
        };

    // Menghapus tugas dari list berdasarkan indeks
    const handleDeleteTask = (index) => {
        const deletedList = list.filter((_, listIndex) => listIndex !== index);
        setList(deletedList);
        
        try {
            // Menyimpan list yang telah diupdate
            AsyncStorage.setItem("@task-list", JSON.stringify(deletedList));
        } catch (e) {
            console.log("Error delete task: in task-all.js");
            console.error(e.message);
        }
    };

    // Mengubah status isCompleted dari tugas di list berdasarkan indeks.
    const handleStatusChange = (index) => {
        setList((prevList) => {
            const newList = [...prevList];
            newList[index].isCompleted = !newList[index].isCompleted;
            return newList;
        });
        
        try {
            // Menyimpan list yang telah diupdate
            AsyncStorage.setItem("@task-list", JSON.stringify(list));
        } catch (e) {
            console.log("Error update status task: in task-all.js");
            console.error(e.message);
        }
    };

    // Mengambil daftar tugas dari AsyncStorage saat komponen TaskScreen dimount.
    const getTaskList = async () => {
        try {
            const value = await AsyncStorage.getItem("@task-list");
            if (value !== null) {
                console.log(value);
                setList(JSON.parse(value));
            } else {
                console.log("No Tasks");
            }
        } catch (e) {
            console.log("Error get task: in task-all.js");
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };
    
    // untuk memanggil getTaskList saat komponen dimount
    useEffect(() => {
        getTaskList();
    }, []);
    
    // Menampilkan input dan tombol "Add Task".
    // saat dalam proses loading, menampilkan spinner.
    return (
    <Box flex={1}>
        <Box mt="15px" mx="15px" mb="7.5px">
            <HStack space="15px">
                <Input
                    size="lg"
                    flex={6}
                    onChangeText={(char) => setInputValue(char)}
                    value={inputValue}
                    borderWidth={1}
                    borderColor="primary.600"
                    placeholder="Add Task"
                />
                <IconButton
                    flex={1}
                    borderRadius="sm"
                    variant="solid"
                    icon={
                <Icon as={Feather} name="plus" size="lg" color="warmGray.50" />
                }
                onPress={() => {
                    handleAddTask(inputValue);
                }}
                />
            </HStack>
        </Box>
        {isLoading ? (
        <Center flex={1}>
            <Spinner size="lg" />
        </Center>
        ) : (
    // jika tidak dalam proses loading menampilkan daftar tugas menggunakan komponen TaskList untuk setiap item dalam list
        <ScrollView>
            <Box mb="15px" mx="15px">
                {list.map((item, index) => (
                <Box key={item.title + index.toString()}>
                    <TaskList
                        data={item}
                        index={index}
                        deletedIcon={true}
                        onItemPress={() => handleStatusChange(index)}
                        onChecked={() => handleStatusChange(index)}
                        onDeleted={() => handleDeleteTask(index)}
                    />
                </Box>
                ))}
            </Box>
        </ScrollView>
        )}
    </Box>
    );
};

export default TaskScreen;
