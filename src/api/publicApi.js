import axios from "axios";

const publicApi = axios.create({
  baseURL: "http://localhost:4534/api",
});

export default publicApi;
