import styled from "styled-components";

const Panel = styled.div`
  border-radius: 25px;
  box-shadow: 0 3px 10px rgb(0 0 0 / 0.4);
  padding: 30px;
  background: ${(props) => props.theme.panel};
  margin-bottom: 15px;
`;

export default Panel;
