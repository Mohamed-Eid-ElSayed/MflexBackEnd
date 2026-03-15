import mongoose from "mongoose";

function connect(uri) {
    return mongoose.connect(uri);
}

export default connect;