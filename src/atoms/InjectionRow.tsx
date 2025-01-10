import Button from "./Button";
import styled from "styled-components";

export interface Injection {
  key: number,
  type: string,
  name: string,
  content: string
}

type Props = {
  injection: Injection,
  setInjectionToEdit: (injection: Injection) => void,
  deleteInjection: (injection: Injection) => void
};

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5em
`;

const InjectionName = styled.div`
    overflow: hidden;
    text-overflow: ellipsis;
`;

const Buttons = styled.div`
    white-space: nowrap;
`;

const StyledButton = styled(Button)`
margin-right: 0.5em;
`;

const InjectionRow = ({ injection, setInjectionToEdit, deleteInjection }: Props): JSX.Element => {

  return (
    <Row>
      <InjectionName>{injection.name}</InjectionName>
      <Buttons>
        <StyledButton size={"icon"}
          onClick={() => deleteInjection(injection)}
        >
          {/* @ts-ignore */}
          <span class="material-symbols-outlined">delete</span>
        </StyledButton>
        <StyledButton size={"icon"}
          onClick={() => setInjectionToEdit(injection)}
        >
          {/* @ts-ignore */}
          <span class="material-symbols-outlined">edit</span>
        </StyledButton>
        <a target={"_blank"}
          rel={"noreferrer"}
          download={`${injection.name.split("/").reverse()[0]}.js`}
          href={window.URL.createObjectURL(new Blob([injection.content], { type: "octet/stream" }))}>
          <Button size={"icon"}>
            {/* @ts-ignore */}
            <span class="material-symbols-outlined">download</span>
          </Button>
        </a>
      </Buttons>
    </Row>
  );
};

export default InjectionRow;