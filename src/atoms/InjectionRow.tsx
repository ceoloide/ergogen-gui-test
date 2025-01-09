import Button from "./Button";
import styled from "styled-components";
import {Dispatch, SetStateAction} from "react";

export interface Injection {
  type: string,
  name: string,
  content: string
}

type Props = {
    type: string,
    name: string,
    content: string,
    injection: Injection,
    setInjection: (injection: Injection) => void
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

const InjectionRow = ({type, name, content, injection, setInjection}: Props): JSX.Element => {
    return (
        <Row>
            <InjectionName>{name}</InjectionName>
            <Buttons>
                <StyledButton size={"icon"}
                        onClick={()=>{}}
                    >
                      {/* @ts-ignore */}
                      <span class="material-symbols-outlined">delete</span>
                </StyledButton>
                <StyledButton size={"icon"}
                        onClick={()=>{}}
                    >
                      {/* @ts-ignore */}
                      <span class="material-symbols-outlined">edit</span>
                </StyledButton>
                <a target={"_blank"}
                   rel={"noreferrer"}
                   download={`${name.split("/").reverse()[0]}.js`}
                   href={window.URL.createObjectURL(new Blob([content], {type: "octet/stream"}))}>
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