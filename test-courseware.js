// Automated Quality Assurance Test Suite for Photosynthesis Courseware
const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
    failed++;
  }
}

console.log('=== RUNNING COURSEWARE QA & ARCHITECTURE TESTS ===\n');

// Test 1: Check all required files exist
const requiredFiles = [
  'index.html',
  'dashboard.html',
  'teacher.html',
  'relationship.html',
  'assessment.html',
  'guide.html',
  'module1.html',
  'module2.html',
  'module3.html',
  'module4.html',
  'module5.html',
  'module6.html',
  'css/styles.css',
  'css/style.css',
  'js/app.js',
  'js/simulations-3d.js',
  'js/firebase-config.js',
  'favicon.svg'
];

requiredFiles.forEach(f => {
  const fullPath = path.join(rootDir, f);
  assert(fs.existsSync(fullPath), `Required file exists: ${f}`);
});

// Test 2: Check for forbidden Unicode raw emojis
const emojiRegex = /[\uD83C-\uDBFF\uDC00-\uDFFF]/;
const htmlFiles = fs.readdirSync(rootDir).filter(f => f.endsWith('.html'));

htmlFiles.forEach(f => {
  const content = fs.readFileSync(path.join(rootDir, f), 'utf8');
  assert(!emojiRegex.test(content), `Zero raw emojis in HTML: ${f}`);
});

const jsFiles = fs.readdirSync(path.join(rootDir, 'js')).filter(f => f.endsWith('.js'));
jsFiles.forEach(f => {
  const content = fs.readFileSync(path.join(rootDir, 'js', f), 'utf8');
  assert(!emojiRegex.test(content), `Zero raw emojis in JS: js/${f}`);
});

// Test 3: Check favicon linked in all HTML files
htmlFiles.forEach(f => {
  const content = fs.readFileSync(path.join(rootDir, f), 'utf8');
  assert(content.includes('favicon.svg'), `Favicon linked in: ${f}`);
});

// Test 4: Check unified CSS linked in all HTML files
htmlFiles.forEach(f => {
  const content = fs.readFileSync(path.join(rootDir, f), 'utf8');
  assert(content.includes('css/styles.css') || content.includes('css/style.css'), `Unified CSS linked in: ${f}`);
});

// Test 5: Verify simulations-3d exports required methods
const simContent = fs.readFileSync(path.join(rootDir, 'js', 'simulations-3d.js'), 'utf8');
const expectedMethods = [
  'setupPointerControls',
  'initStation1',
  'initStation2',
  'initStation3',
  'initStation4',
  'initStation5',
  'initStation6',
  'initRelationship'
];

expectedMethods.forEach(method => {
  assert(simContent.includes(method), `simulations-3d.js implements method: ${method}`);
});

// Test 6: Check dual track entry in index.html
const indexContent = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
assert(indexContent.includes('btnEnterStudent'), 'index.html has Student Track entrance');
assert(indexContent.includes('btnEnterTeacher'), 'index.html has Teacher Track entrance');
assert(indexContent.includes('dashboard.html'), 'Student track links to dashboard.html');
assert(indexContent.includes('teacher.html'), 'Teacher track links to teacher.html');

// Test 7: Verify Teacher Dashboard has Rubrics and CMS
const teacherContent = fs.readFileSync(path.join(rootDir, 'teacher.html'), 'utf8');
assert(teacherContent.includes('tabRubricsMatrix'), 'Teacher dashboard includes Rubrics Matrix');
assert(teacherContent.includes('tabCurriculumCMS'), 'Teacher dashboard includes Curriculum CMS');
assert(teacherContent.includes('savePermissionsBtn'), 'Teacher dashboard includes permissions save button');

console.log(`\n=== QA RESULTS: ${passed} PASSED, ${failed} FAILED ===\n`);
if (failed > 0) process.exit(1);
