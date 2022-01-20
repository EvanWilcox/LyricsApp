import React from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import Panel from "./Panel";

const Lyrics = (props) => {
  return (
    props.lyrics && (
      <Panel>
        {props.lyrics.split(/\r?\n/).map((lyric, index) => {
          return lyric === "" ? <br key={index} /> : <Lyric key={index}>{lyric}</Lyric>;
        })}
      </Panel>
    )
  );
};

Lyrics.propTypes = {
  lyrics: PropTypes.string.isRequired,
};

const Lyric = styled.p`
  font-size: 20px;
  margin: 0px;
  color: ${(props) => props.theme.text};
`;

export default Lyrics;
