import {useEffect, useState} from "react";
import styled from "styled-components";
import Split from "react-split";
import yaml from 'js-yaml';

import ConfigEditor from "./molecules/ConfigEditor";
import Downloads from "./molecules/Dowloads";
import Injections from "./molecules/Injections";
import FilePreview from "./molecules/FilePreview";

import {useConfigContext} from "./context/ConfigContext";
import Button from "./atoms/Button";
import Input from "./atoms/Input";
import TextPreview from "./atoms/TextPreview";
import Select from "react-select";
import GenOption from "./atoms/GenOption";
import {ConfigOption, exampleOptions} from "./examples";

const EditorContainer = styled.div`
  position: relative;
  height: 85%;
  display: flex;
  flex-direction: column;
  width: 100%;
  flex-grow: 1;
`;

const InjectionEditorContainer = styled.div`
  position: relative;
  height: 50%;
  display: flex;
  flex-direction: column;
  width: 100%;
  flex-grow: 1;
`;

const FlexContainer = styled.div`
  display: flex;
  flex-flow: wrap;
`;

const Error = styled.div`
  background: #ff6d6d;
  color: #a31111;
  border: 1px solid #a31111;
  padding: 1em;
  margin: 0.5em 0 0.5em 0;
  width: 100%;
  min-height: 4em;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StyledFilePreview = styled(FilePreview)`
  height: 100%;
`;

const StyledConfigEditor = styled(ConfigEditor)`
  position: relative;
`;

const StyledTextPreview = styled(TextPreview)`
  position: relative;
`;

const OptionContainer = styled.div`
  display: inline-grid;
  justify-content: space-between;
`;

const StyledSelect = styled(Select)`
    color: black;
    white-space: nowrap;
`;

// @ts-ignore
const StyledSplit = styled(Split)`
  width: 100%;
  height: 100%;
  display: flex;
  padding: 1rem;

  .gutter {
    background-color: #878787;
    border-radius: 0.15rem;

    background-repeat: no-repeat;
    background-position: 50%;

    &:hover {
      background-color: #a0a0a0;
    }

    &.gutter-horizontal {
      cursor: col-resize;
      background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==');
    }
  }
`;

const LeftSplitPane = styled.div`
    padding-right: 1rem;
    position: relative;
`;

const RightSplitPane = styled.div`
    padding-left: 1rem;
    position: relative;
`;

const findResult = (resultToFind : string, resultsToSearch : any) : (any | undefined) => {
  if (resultsToSearch === null) return null;
  if (resultToFind === '') return resultsToSearch;
  let properties = resultToFind.split('.');
  let currentProperty = properties[0] as keyof typeof resultsToSearch;
  let remainingProperties = properties.slice(1).join('.');
  return (resultsToSearch.hasOwnProperty(currentProperty)
    ? findResult(
        remainingProperties,
        resultsToSearch[currentProperty]
      )
    : undefined);
};

const Ergogen = () => {
    const [preview, setPreviewKey] = useState({key: "demo.svg", extension: "svg", content: ""});
    const [injection, setInjectionKey] = useState({type: "", name: "", content: ""});
    const [selectedOption, setSelectedOption] = useState<ConfigOption|null>(null);
    const configContext = useConfigContext();
    
    useEffect(()=>{
      if(selectedOption?.value) {
        configContext?.setConfigInput(selectedOption.value)
      }
      // eslint-disable-next-line
    }, [selectedOption]);
    if (!configContext) return null;
    let result = null;
    if (configContext.results) {
      result = findResult(preview.key, configContext.results);
      if (result === undefined && preview.key !== "demo.svg") {
        // If we don't find the preview we had, switch to demo.svg
        preview.key = "demo.svg"
        preview.extension = "svg"
        result = findResult(preview.key, configContext.results);
      }

      switch(preview.extension) {
        case 'svg':
        case 'kicad_pcb':
          preview.content = (typeof result === "string" ? result :  "");
          break;
        case 'jscad':
          preview.content = (typeof result?.jscad === "string" ? result.jscad :  "");
          break;
        case 'yaml':
          preview.content = yaml.dump(result);
          break;
        default:
          preview.content = ""
      };
    }

    return (<div>
        {configContext.error && <Error>{configContext.error?.toString()}</Error>}
        <FlexContainer>
          {!configContext.showSettings ?
            (<StyledSplit
                direction={"horizontal"}
                sizes={[30, 70]}
                minSize={100}
                gutterSize={10}
                snapOffset={0}
            >
                <LeftSplitPane>
                    <EditorContainer>
                        <StyledSelect
                            options={exampleOptions}
                            value={selectedOption}
                            // @ts-ignore
                            onChange={(newValue: ConfigOption|null) => setSelectedOption(newValue)}
                            placeholder={"Paste your config below, or select an example here!"}
                        />
                        <StyledConfigEditor/>
                        <Button onClick={() => configContext.processInput(configContext.configInput, configContext.injectionInput, {pointsonly: false})}>Generate</Button>
                    </EditorContainer>
                </LeftSplitPane>

                <RightSplitPane>
                    <StyledSplit
                        direction={"horizontal"}
                        sizes={[70, 30]}
                        minSize={100}
                        gutterSize={10}
                        snapOffset={0}
                    >
                        <LeftSplitPane>
                            <StyledFilePreview previewExtension={preview.extension} previewKey={preview.key} previewContent={preview.content}/>
                        </LeftSplitPane>
                        <RightSplitPane>
                            <Downloads setPreview={setPreviewKey}/>
                        </RightSplitPane>
                    </StyledSplit>
                </RightSplitPane>
            </StyledSplit>) : (
                <OptionContainer>
                    <h3>Options</h3>
                    <GenOption optionId={'autogen'} label={'Live reload'} setSelected={configContext.setAutoGen} checked={configContext.autoGen}/>
                    <GenOption optionId={'debug'} label={'Debug mode'} setSelected={configContext.setDebug} checked={configContext.debug}/>
                    <GenOption optionId={'autogen3d'} label={<>Include PCB, 3D cases in live reload <small>(slow)</small></>} setSelected={configContext.setAutoGen3D} checked={configContext.autoGen3D}/>
                </OptionContainer>
            )}
        </FlexContainer></div>
    );
}

export default Ergogen;