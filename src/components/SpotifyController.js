import React, { Component } from "react";
import Panel from "./Panel";
import styled from "styled-components";

class MediaController extends Component {
  constructor(props) {
    super();

    this.state = { displayName: "" };

    props.spotifyApi.getMe().then((response) => {
      this.setState({ displayName: response.display_name });
    });
  }

  render() {
    const { displayName } = this.state;

    return (
      <Panel>
        <Text>
          Logged in as: <b>{displayName}</b>
        </Text>
      </Panel>
    );
  }
}

export default MediaController;

const Text = styled.p`
  color: ${(props) => props.theme.text};
  margin: 0;
`;
