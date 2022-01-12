import React, { Component } from "react";
import "./App.css";
import styled from "styled-components";
import SpotifyWebApi from "spotify-web-api-js";

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

  render() {
    const { loggedIn, nowPlaying, lyrics } = this.state;
    const { name, artists, albumArt } = nowPlaying;

    if (!loggedIn) {
      // Redirect to Spotify Login page.
      window.location.href = "/login";
    } else {
      return (
        <Page>
          <Content>
            <Song>
              {name && artists && albumArt && (
                <>
                  <Title>{name}</Title>
                  <Artists>{artists.join(", ")}</Artists>
                  <AlbumArt src={albumArt} alt="" />
                </>
              )}
            </Song>
            <Lyrics>
              {lyrics.split(/\r?\n/).map((lyric, index) => {
                return lyric === "" ? <br key={index} /> : <Lyric key={index}>{lyric}</Lyric>;
              })}
            </Lyrics>
          </Content>
          <Footer>
            <Link href="https://evanwilcox.com">Evan Wilcox</Link>
          </Footer>
        </Page>
      );
    }
  }
}

const AlbumArt = styled.img`
  height: 400px;
  width: 400px;
  margin: 25px 0px 50px 0px;
`;

const Artists = styled.p`
  font-size: 30px;
  margin: 0px;
`;

const Content = styled.div`
  width: "100%";
  display: flex;
  flex-direction: row-reverse;
  flex-wrap: wrap;
  justify-content: space-around;
  padding-bottom: 100px;
`;

const Footer = styled.div`
  width: calc(100% - 100px);
  margin: 0px auto;
  position: absolute;
  bottom: 0;
  text-align: center;
  padding-bottom: 30px;
`;

const Link = styled.a`
  text-decoration: none;
  color: black;

  &::visited {
    color: black;
  }
  &::hover {
    color: gray;
  }
`;

const Lyric = styled.p`
  font-size: 25px;
  margin: 0px;
`;

const Lyrics = styled.div`
  min-width: 500px;
  max-width: 700px;
`;

const Page = styled.div`
  min-height: calc(100vh - 100px);
  max-width: 100%;
  position: relative;
  padding: 50px 50px 0px 50px;
  overflow-x: hidden;
`;

const Song = styled.div`
  min-width: 400px;
  max-width: 600px;
`;

const Title = styled.p`
  font-size: 50px;
  overflow-wrap: break-word;
  margin: 0px;
`;