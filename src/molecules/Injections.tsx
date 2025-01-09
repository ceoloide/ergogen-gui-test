import InjectionRow from "../atoms/InjectionRow";
import Button from "../atoms/Button";
import { Injection } from "../atoms/InjectionRow";
import yaml from 'js-yaml';
import styled from "styled-components";
import { useConfigContext } from "../context/ConfigContext";
import { Dispatch, SetStateAction, useContext } from "react";
// import { TabContext } from "../organisms/Tabs";

const InjectionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const StyledButton = styled(Button)`
margin-right: 0.5em;
margin-left: 1.5em;
`;

const HeaderWithButton = styled.div`
    white-space: nowrap;
    display: flex;
    width: 100%
    flex-direction: column;
`;

type Props = {
  setInjection: Dispatch<SetStateAction<Injection>>
};

type InjectionObj = {
  name: string,
  type: string,
  content: string,
  injection: Injection,
};

type InjectionArr = Array<InjectionObj>;

const Injections = ({ setInjection }: Props) => {
  let footprints: InjectionArr = [];
  let templates: InjectionArr = [];
  const configContext = useConfigContext();
  // const tabContext = useContext(TabContext);
  if (!configContext) return null;

  const { injectionInput } = configContext;
  if (injectionInput && Array.isArray(injectionInput) && injectionInput.length > 0) {
    for (const [injType, injName, injContent] of injectionInput) {
      let collection = (injType === "footprint" ? footprints : templates);
      collection.push(
        {
          type: injType,
          name: injName,
          content: injContent,
          injection: {
            type: injType,
            name: injName,
            content: injContent,
          }
        }
      )
    }
  }

  return (
    <InjectionsContainer>
      <HeaderWithButton>
        <h3>Custom Footprints</h3>
        <StyledButton size={"icon"}
                onClick={()=>{}}
            >
              {/* @ts-ignore */}
              <span class="material-symbols-outlined">add</span>
        </StyledButton>
      </HeaderWithButton>
      {
        footprints.map(
          (footprint, i) => {
            return <InjectionRow key={i} {...footprint} setInjection={setInjection} />;
          }
        )
      }
      <h3>Custom Templates</h3>
      {
        templates.map(
          (template, i) => {
            return <InjectionRow key={i} {...template} setInjection={setInjection} />;
          }
        )
      }
    </InjectionsContainer>
  );
};

export default Injections;