import { message } from "./constants/message.js";
import type { StringBox } from "./models/stringBox.js";

const box: StringBox = {
  content: message,
};

console.log(box.content);
