const users = []

//addUser, removeUser, getUser, getUsersInRoom

const addUser = ({ id, username, room }) => {
    //Clean the data

    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Validate the data
    if (!username  || !room) {
        return {
            error: 'Username and room are required!'
        }
    }

    //Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    //Validate username
    if (existingUser) {
        return {
            error: 'Username is already taken!'
        }
    }

    // Store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    const searchUser = users.find((user) => user.id === id)

    if (!searchUser) {
        return 'No user has been found!'
    }

    return searchUser
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    const get = users.filter((user) => {
        return user.room === room
    })

    if (get.length === 0) {
        return 'No users has been found!'
    }

    return get
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}