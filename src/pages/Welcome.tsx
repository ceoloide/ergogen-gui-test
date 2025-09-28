import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useConfigContext } from '../context/ConfigContext';
import { exampleOptions, ConfigOption } from '../examples';
import EmptyYAML from '../examples/empty_yaml';
import { fetchConfigFromUrl } from '../utils/github';
import Button from '../atoms/Button';
import Input from '../atoms/Input';

// Styled Components
const WelcomeContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  color: #fff;
  flex-grow: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.h1`
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 1rem;
`;

const SubHeader = styled.p`
  font-size: 1.2rem;
  text-align: center;
  margin-bottom: 3rem;
  color: #ccc;
`;

const OptionsContainer = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 3rem;
  justify-content: center;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const OptionBox = styled.div`
  background-color: #2a2a2a;
  padding: 2rem;
  border-radius: 8px;
  border: 1px solid #3f3f3f;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
  }

  h2 {
    margin-top: 0;
    margin-bottom: 1rem;
  }

  p {
    color: #aaa;
    margin-bottom: 1.5rem;
    flex-grow: 1;
  }
`;

const GitHubInputContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  width: 100%;
  max-width: 400px;
`;

const ExamplesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const ExampleCard = styled.div`
  background-color: #2a2a2a;
  border-radius: 8px;
  border: 1px solid #3f3f3f;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  overflow: hidden;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  }
`;

const PlaceholderImage = styled.div`
  width: 100%;
  height: 150px;
  background-color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-style: italic;
`;

const ExampleName = styled.div`
  padding: 1rem;
  font-weight: 600;
  text-align: center;
`;

const ErrorMessage = styled.div`
  background: #ff6d6d;
  color: #a31111;
  border: 1px solid #a31111;
  padding: 1em;
  margin-top: 1em;
  border-radius: 6px;
  text-align: center;
`;

// Flatten examples into a single list, excluding the "Empty" one which has a dedicated button
const allExamples: ConfigOption[] = exampleOptions
  .flatMap(group => group.options)
  .filter(ex => ex.label !== 'Empty');

const Welcome = () => {
  const navigate = useNavigate();
  const configContext = useConfigContext();
  const [githubUrl, setGithubUrl] = useState('');
  const [githubError, setGithubError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectExample = (configValue: string) => {
    configContext?.setConfigInput(configValue);
    navigate('/');
  };

  const handleLoadFromGithub = () => {
    if (!githubUrl) return;
    setIsLoading(true);
    setGithubError(null);
    fetchConfigFromUrl(githubUrl)
      .then((data) => {
        configContext?.setConfigInput(data);
        navigate('/');
      })
      .catch((e) => {
        setGithubError(`Failed to fetch config from GitHub: ${e.message}`);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <WelcomeContainer>
      <Header>Welcome to Ergogen Web UI</Header>
      <SubHeader>
        A web-based interface for Ergogen, the ergonomic keyboard generator.
        <br />
        Start a new design below.
      </SubHeader>

      <OptionsContainer>
        <OptionBox>
          <h2>Start Fresh</h2>
          <p>Begin with a completely blank slate.</p>
          <Button onClick={() => handleSelectExample(EmptyYAML.value)}>
            Empty Configuration
          </Button>
        </OptionBox>
        <OptionBox>
          <h2>From the Web</h2>
          <p>Load a configuration from a GitHub repository.</p>
          <GitHubInputContainer>
            <Input
              placeholder="Paste a GitHub URL..."
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              disabled={isLoading}
            />
            <Button onClick={handleLoadFromGithub} disabled={isLoading || !githubUrl}>
              {isLoading ? 'Loading...' : 'Load'}
            </Button>
          </GitHubInputContainer>
          {githubError && <ErrorMessage>{githubError}</ErrorMessage>}
        </OptionBox>
      </OptionsContainer>

      <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2rem' }}>Or start from an example</h2>

      <ExamplesGrid>
        {allExamples.map((example) => (
          <ExampleCard key={example.label} onClick={() => handleSelectExample(example.value)}>
            <PlaceholderImage>
              <span>Placeholder</span>
            </PlaceholderImage>
            <ExampleName>{example.label}</ExampleName>
          </ExampleCard>
        ))}
      </ExamplesGrid>

    </WelcomeContainer>
  );
};

export default Welcome;