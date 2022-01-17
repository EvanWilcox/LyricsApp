import styled from "styled-components";

const Panel = styled.div`
  border-radius: 25px;
  padding: 20px;
  min-width: 100px;
  min-height: 100px;
  padding: 10px;
  box-shadow: 0 3px 10px rgb(0 0 0 / 0.4);
  padding: 30px;
  background: ${(props) => props.theme.panel};
`;

export default Panel;
