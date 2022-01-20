import React from "react";
import styled from "styled-components";
import Panel from "./Panel";
import ToggleSwitch from "./ToggleSwitch";
import PropTypes from "prop-types";

const ThemeChanger = (props) => {
  return (
    <Panel>
      <Text>Dark Mode:</Text>
      <ToggleSwitch name="ThemeToggle" checked={props.theme === "dark"} onChange={props.themeToggle} />
    </Panel>
  );
};

ThemeChanger.propTypes = {
  theme: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default ThemeChanger;

const Text = styled.p`
  display: inline;
  margin: 0px;
  padding-right: 15px;
  color: ${(props) => props.theme.text};
`;
