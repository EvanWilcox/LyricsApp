import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import Panel from "./Panel";

const SongTitleCard = (props) => {
  const { name, artists, albumArt } = props.nowPlaying;

  return (
    name &&
    artists &&
    albumArt && (
      <Panel>
        <Title>{name}</Title>
        <Artists>{artists.join(", ")}</Artists>
        <AlbumArt src={albumArt} alt="" />
      </Panel>
    )
  );
};

SongTitleCard.propTypes = {
  nowPlaying: PropTypes.object.isRequired,
};

const AlbumArt = styled.img`
  height: 100%;
  width: 100%;
  max-height: 400px;
  max-width: 400px;
  display: block;
  margin-top: 20px;
  margin-left: auto;
  margin-right: auto;
`;

const Artists = styled.p`
  font-size: 20px;
  margin: 0px;
  color: ${(props) => props.theme.text};
`;

const Title = styled.p`
  font-size: 30px;
  overflow-wrap: break-word;
  margin: 0px;
  color: ${(props) => props.theme.text};
`;

export default SongTitleCard;
