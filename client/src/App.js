import "./App.css";
import {
  Link,
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import BinnedImages from "./components/BinnedImages";
import Images from "./components/Images";
import MyPosts from "./components/MyPosts";
import NewImage from "./components/NewImage";
import PopularImages from "./components/PopularImages";
import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  ApolloProvider,
} from "@apollo/client";
const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: "http://localhost:4000",
  }),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <div className="App">
          <h1 className="App-title">Binterest</h1>
          <nav>
            <Link className="navlink" to="/">
              Images
            </Link>

            <Link className="navlink" to="/my-bin">
              My Bin
            </Link>

            <Link className="navlink" to="/my-posts">
              My Posts
            </Link>

            <Link className="navlink" to="/popularity">
              Popularity
            </Link>
          </nav>
          <br></br>
          <br></br>
          <Routes>
            <Route exact path="/" element={<Images />} />
            <Route path="/my-posts" element={<MyPosts />} />
            <Route path="/my-bin" element={<BinnedImages />} />
            <Route path="/new-post" element={<NewImage />} />
            <Route path="/popularity" element={<PopularImages />} />
          </Routes>
        </div>
      </Router>
    </ApolloProvider>
  );
}

export default App;
