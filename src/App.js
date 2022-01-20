import React, { Component } from "react";
import "./App.css";
import styled, { ThemeProvider } from "styled-components";
import SpotifyWebApi from "spotify-web-api-js";

import Lyrics from "./components/Lyrics";
import MediaController from "./components/SpotifyController";
import SongTitleCard from "./components/SongTitleCard";
import ThemeChanger from "./components/ThemeChanger";

import { darkTheme, lightTheme } from "./Themes";

// Declare a new SpotifyWebApi object
const spotifyApi = new SpotifyWebApi();

export default class App extends Component {
  constructor() {
    super();

    // Get access_token from params
    var { access_token } = this.getHashParams() || null;

    if (access_token) {
      // Clear params from url
      window.history.replaceState({}, document.title, "/");

      // Set the access_token for the SpotifyWebApi
      spotifyApi.setAccessToken(access_token);

      // Set the initial state for the component
      this.state = {
        loggedIn: true,
        nowPlaying: { name: "", artists: [], albumArt: "" },
        lyrics: "",
        theme: window.localStorage.getItem("theme") || "light",
      };

      // Start refresh timer to get the currently playing song.
      this.timer = setInterval(() => this.getNowPlaying(), 1000);
    } else {
      this.state = { loggedIn: false, nowPlaying: { name: "", artists: [], albumArt: "" }, lyrics: "" };
    }
  }

  getHashParams() {
    // Used to get the hashed params from the url
    var hashParams = {};
    var e,
      r = /([^&;=]+)=?([^&;]*)/g,
      q = window.location.hash.substring(1);
    e = r.exec(q);
    while (e) {
      hashParams[e[1]] = decodeURIComponent(e[2]);
      e = r.exec(q);
    }
    return hashParams;
  }

  getNowPlaying() {
    const { loggedIn, nowPlaying } = this.state;

    if (loggedIn) {
      spotifyApi.getMyCurrentPlaybackState().then(
        (response) => {
          if (response) {
            if (response.item.name !== nowPlaying.name) {
              this.setState({
                nowPlaying: {
                  name: response.item.name,
                  artists: response.item.artists.map((artist) => artist.name),
                  albumArt: response.item.album.images[0].url,
                },
                lyrics: "Loading...",
              });

              this.getLyrics();
            }
          } else {
            this.setState({
              lyrics: "Nothing is playing right now...\nStart playing something on your Spotify account. ",
              nowPlaying: { name: "", artists: [], albumArt: "" },
            });
          }
        },
        (err) => {
          this.setState({ loggedIn: false });
        }
      );
    }
  }

  async getLyrics() {
    const { nowPlaying } = this.state;

    // Returns the according Genius page for the current song and artist in text format.
    await fetch("/lyrics?song=" + encodeURI(nowPlaying.name) + "&artist=" + encodeURI(nowPlaying.artists[0]))
      .then((response) => response.text())
      .then((data) => new window.DOMParser().parseFromString(data, "text/html"))
      .then((document) => {
        const items = document.querySelectorAll('div[class^="Lyrics__Container"]');
        let lyrics = "";
        items.forEach((el) => {
          lyrics +=
            el.innerHTML
              .replace(/<br>/g, "\n")
              .replace(/<(?!\s*br\s*\/?)[^>]+>/gi, "")
              .replaceAll("amp;", "") + "\n";
        });
        if (lyrics) {
          this.setState({ lyrics: lyrics });
        } else {
          this.setState({ lyrics: "[Lyrics Not Found]" });
        }
      });
  }

  themeToggle = () => {
    this.setState({ theme: this.state.theme === "light" ? "dark" : "light" }, () => {
      window.localStorage.setItem("theme", this.state.theme);
    });
  };

  render() {
    const { loggedIn, nowPlaying, lyrics, theme } = this.state;
    //const { name, artists, albumArt } = nowPlaying;

    if (!loggedIn) {
      // Redirect to Spotify Login page.
      window.location.href = "/login";
    } else {
      return (
        <ThemeProvider theme={theme === "light" ? lightTheme : darkTheme}>
          <Page>
            <Content>
              <div>
                <ThemeChanger theme={theme} themeToggle={this.themeToggle} />
                <MediaController spotifyApi={spotifyApi} />
                <SongTitleCard nowPlaying={nowPlaying} />
              </div>
              <div>
                <Lyrics lyrics={lyrics} />
              </div>
            </Content>
            <Footer>
              <Link href="https://evanwilcox.com">Evan Wilcox</Link>
            </Footer>
          </Page>
        </ThemeProvider>
      );
    }
  }
}

// Styled Components
const Content = styled.div`
  padding-bottom: 100px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
  align-items: flex-start;
  column-gap: 30px;
`;

const Footer = styled.div`
  height: 85px;
  width: calc(100% - 30px);
  margin: 0px;
  position: absolute;
  bottom: 0;
  text-align: center;
`;

const Link = styled.a`
  text-decoration: none;
  color: ${(props) => props.theme.text};
  margin: 0px;

  &::visited {
    color: black;
  }
  &::hover {
    color: gray;
  }
`;

const Page = styled.div`
  min-height: calc(100vh - 15px);
  min-width: calc(100vw - 50px);
  position: relative;
  padding: 15px 15px 0px 15px;
  overflow-x: hidden;
  background: ${(props) => props.theme.background};
`;
