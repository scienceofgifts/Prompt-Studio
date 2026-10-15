import { buildGeminiPhotoPrompt } from '../modelFormatters';
import { PromptOptions } from '../../types';

function runTests() {
  console.log('Running Gemini Prompt Generator Tests...');

  // Test 1: Folded T-shirt orientation
  const tshirtOptions: PromptOptions = {
    productType: 'tshirt',
    orientation: 'folded',
    background: 'gradient-wall-neutral-surface',
    surface: 'editorial-tabletop',
    props: 'none',
    aspectRatio: '1:1',
    additionalInstructions: '',
    cameraAngle: 'straight-on',
    shotType: 'hero-product',
    lightingStyle: 'large-soft-studio',
  };

  const tshirtPrompt = buildGeminiPhotoPrompt(tshirtOptions);
  if (
    !tshirtPrompt.includes('resting flat on the tabletop surface') ||
    !tshirtPrompt.includes('front printed graphic facing upward')
  ) {
    throw new Error('Test 1 Failed: Folded T-shirt orientation instructions missing flat resting or graphic facing upward');
  }
  console.log('Test 1 Passed: Folded T-shirt orientation staging verified.');

  // Test 2: Upright Mug orientation
  const mugOptions: PromptOptions = {
    productType: 'mug',
    orientation: 'upright',
    background: 'science-gradient',
    surface: 'light-stone',
    props: 'minimal-subtle',
    aspectRatio: '4:5',
    additionalInstructions: '',
    cameraAngle: 'three-quarter',
    shotType: 'hero-product',
    lightingStyle: 'soft-daylight',
  };

  const mugPrompt = buildGeminiPhotoPrompt(mugOptions);
  if (
    !mugPrompt.includes('Standing upright and resting firmly on its solid base') ||
    !mugPrompt.includes('no suspension or invisible support')
  ) {
    throw new Error('Test 2 Failed: Upright Mug orientation missing solid base resting instruction');
  }
  console.log('Test 2 Passed: Upright Mug orientation verified.');

  // Test 3: Flat-lay orientation
  const notebookOptions: PromptOptions = {
    productType: 'notebook',
    orientation: 'flat-lay',
    background: 'warm-ivory',
    surface: 'paper-archival',
    props: 'none',
    aspectRatio: '3:2',
    additionalInstructions: '',
    cameraAngle: 'gentle-overhead',
    shotType: 'standard-catalog',
    lightingStyle: 'diffused-frontal',
  };

  const notebookPrompt = buildGeminiPhotoPrompt(notebookOptions);
  if (
    !notebookPrompt.includes('Architectural 90-degree overhead flat-lay view') ||
    !notebookPrompt.includes('Overhead 90-degree flat-lay camera looking straight down')
  ) {
    throw new Error('Test 3 Failed: Flat-lay orientation or camera angle missing 90-degree overhead instruction');
  }
  console.log('Test 3 Passed: Flat-lay notebook orientation and camera verified.');

  // Test 4: Potted Plant Styling toggle
  const plantOptionsTrue: PromptOptions = {
    ...tshirtOptions,
    includePottedPlant: true,
  };
  const plantPromptTrue = buildGeminiPhotoPrompt(plantOptionsTrue);
  if (!plantPromptTrue.includes('Potted Plant Styling')) {
    throw new Error('Test 4 Failed: includePottedPlant=true did not include plant instruction');
  }

  const plantOptionsFalse: PromptOptions = {
    ...tshirtOptions,
    includePottedPlant: false,
  };
  const plantPromptFalse = buildGeminiPhotoPrompt(plantOptionsFalse);
  if (plantPromptFalse.includes('Potted Plant Styling')) {
    throw new Error('Test 4 Failed: includePottedPlant=false included plant instruction when it should not have');
  }
  console.log('Test 4 Passed: Potted Plant Styling toggle verified.');

  // Test 5: Tabletop construction and minimal prop count
  const tabletopOptions: PromptOptions = {
    ...mugOptions,
    surface: 'travertine',
    props: 'subtle-historical',
    propLevel: 'minimal',
  };
  const tabletopPrompt = buildGeminiPhotoPrompt(tabletopOptions);
  if (
    !tabletopPrompt.includes('substantial, solid tabletop or platform') ||
    !tabletopPrompt.includes('Prefer two distinct, complementary secondary props')
  ) {
    throw new Error('Test 5 Failed: Tabletop construction or minimal prop count guidance missing');
  }
  console.log('Test 5 Passed: Tabletop physical construction and minimal prop count verified.');

  console.log('All Gemini prompt validation tests passed successfully!');
}

runTests();
