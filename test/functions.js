const msg = require('../modules/message.js')

testMessage = {
    author: {
        username: "Milhound"
    },
    channel:{
        send: (msg) => {
            console.log(msg)
        }
    },
    delete: (time) => {
        console.log("Message was Deleted.")
    },
    content: "",
    guild: {
        name: "Milhound's Server"
    }
}
describe("Command", function() {
    before( function () { testMessage.content = "!ping"})
    it("Should reply with Pong", function() {
        msg.cmds(testMessage).should.log("Pong!")
    }) 
})
