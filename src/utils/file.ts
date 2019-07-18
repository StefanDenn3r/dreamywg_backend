import uuid = require('uuid/v1')
import {promises as fs} from 'fs'

const saveImageToFile = async (data) => {
    const base64Data = data.replace(/^data:image\/png;base64,/, "");
    const fileName = `${uuid()}.png`

    await fs.writeFile(`images/${fileName}`, base64Data, 'base64')
    return fileName
};

export {saveImageToFile}