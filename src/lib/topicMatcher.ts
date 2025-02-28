type TopicKeywords = {
  [key: string]: {
    exactMatches: string[];
    keywords: string[];
    contentKeywords: string[];
    frameworks: string[];
    tools: string[];
    concepts: string[];
  }
}

export const topicMatchers: TopicKeywords = {
  'programming': {
    exactMatches: ['programming', 'coding', 'development', 'software engineering'],
    keywords: ['code', 'programming', 'algorithm', 'software', 'git', 'debugging'],
    contentKeywords: ['function', 'class', 'variable', 'loop', 'algorithm', 'debug', 'compile'],
    frameworks: ['spring', 'django', 'laravel', '.net', 'ruby on rails'],
    tools: ['git', 'github', 'gitlab', 'vscode', 'intellij', 'eclipse'],
    concepts: ['oop', 'functional programming', 'design patterns', 'solid principles', 'clean code']
  },
  'web-development': {
    exactMatches: ['web development', 'frontend', 'backend', 'fullstack', 'web engineering'],
    keywords: ['html', 'css', 'javascript', 'react', 'vue', 'angular', 'node', 'express', 'web'],
    contentKeywords: ['component', 'api', 'server', 'client', 'browser', 'dom', 'responsive'],
    frameworks: [
      'react', 'vue', 'angular', 'svelte', 'next.js', 'nuxt', 'gatsby',
      'express', 'nest.js', 'django', 'flask', 'laravel', 'ruby on rails'
    ],
    tools: [
      'webpack', 'vite', 'babel', 'eslint', 'prettier', 'npm', 'yarn', 'pnpm',
      'chrome devtools', 'postman', 'insomnia'
    ],
    concepts: [
      'responsive design', 'spa', 'ssr', 'ssg', 'pwa', 'web apis',
      'rest', 'graphql', 'websockets', 'oauth', 'jwt'
    ]
  },
  'machine-learning': {
    exactMatches: ['machine learning', 'ml', 'data science', 'deep learning'],
    keywords: ['ml', 'tensorflow', 'pytorch', 'neural network', 'deep learning', 'ai'],
    contentKeywords: ['model', 'training', 'dataset', 'prediction', 'classification', 'regression'],
    frameworks: [
      'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'xgboost',
      'lightgbm', 'fastai', 'hugging face'
    ],
    tools: [
      'jupyter', 'colab', 'kaggle', 'numpy', 'pandas', 'matplotlib',
      'seaborn', 'opencv', 'cuda'
    ],
    concepts: [
      'neural networks', 'supervised learning', 'unsupervised learning',
      'reinforcement learning', 'computer vision', 'nlp', 'transformers'
    ]
  },
  'artificial-intelligence': {
    exactMatches: [
      'artificial intelligence', 'ai', 'cognitive computing',
      'artificial-intelligence', 'a.i.', 'a.i', 'ai.', // Common variations
      'artificial general intelligence', 'agi'
    ],
    keywords: [
      'ai', 'gpt', 'llm', 'chatbot', 'nlp', 'machine learning',
      'neural', 'deep learning', 'intelligent', 'cognitive',
      'ai model', 'ai system', 'ai-powered', 'ai based'
    ],
    contentKeywords: [
      'intelligence', 'model', 'neural', 'training', 'language', 'cognitive',
      'artificial', 'intelligent system', 'smart algorithm'
    ],
    frameworks: [
      'openai', 'langchain', 'transformers', 'spacy', 'nltk',
      'rasa', 'dialogflow', 'bert', 'gpt-3', 'gpt-4',
      'palm', 'claude', 'llama', 'stable-diffusion'
    ],
    tools: [
      'chatgpt', 'gpt-4', 'claude', 'stable diffusion', 'dall-e',
      'midjourney', 'tensorflow', 'pytorch', 'bard', 'copilot',
      'anthropic', 'gemini'
    ],
    concepts: [
      'natural language processing', 'computer vision', 'robotics',
      'expert systems', 'knowledge representation', 'reasoning',
      'machine intelligence', 'neural networks', 'deep learning'
    ]
  },
  'mobile-development': {
    exactMatches: ['mobile development', 'app development', 'ios development', 'android development'],
    keywords: ['android', 'ios', 'swift', 'kotlin', 'react native', 'flutter', 'mobile'],
    contentKeywords: ['mobile', 'app', 'screen', 'device', 'responsive', 'native'],
    frameworks: [
      'react native', 'flutter', 'ionic', 'xamarin', 'swiftui',
      'jetpack compose', 'native android', 'native ios'
    ],
    tools: [
      'android studio', 'xcode', 'vs code', 'firebase', 'fastlane',
      'app center', 'testflight', 'expo'
    ],
    concepts: [
      'responsive design', 'offline storage', 'push notifications',
      'app lifecycle', 'mobile security', 'performance optimization'
    ]
  },
  'cloud-computing': {
    exactMatches: ['cloud', 'cloud computing', 'devops', 'cloud native'],
    keywords: ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'serverless'],
    contentKeywords: ['server', 'deploy', 'scale', 'container', 'cloud', 'infrastructure'],
    frameworks: [
      'terraform', 'cloudformation', 'ansible', 'puppet', 'chef',
      'kubernetes', 'docker swarm', 'istio'
    ],
    tools: [
      'aws cli', 'azure cli', 'gcloud', 'kubectl', 'helm',
      'prometheus', 'grafana', 'jenkins', 'gitlab ci'
    ],
    concepts: [
      'iaas', 'paas', 'saas', 'serverless', 'microservices',
      'containers', 'orchestration', 'ci/cd', 'devops'
    ]
  },
  'security': {
    exactMatches: ['security', 'cybersecurity', 'infosec', 'information security'],
    keywords: ['security', 'encryption', 'authentication', 'vulnerability', 'hack', 'pentest'],
    contentKeywords: ['secure', 'protect', 'encrypt', 'auth', 'token', 'vulnerability'],
    frameworks: [
      'spring security', 'oauth', 'openid connect', 'jwt',
      'keycloak', 'auth0', 'okta'
    ],
    tools: [
      'nmap', 'wireshark', 'metasploit', 'burp suite', 'owasp zap',
      'kali linux', 'hashcat', 'john the ripper'
    ],
    concepts: [
      'encryption', 'authentication', 'authorization', 'zero trust',
      'threat modeling', 'penetration testing', 'incident response'
    ]
  },
  'databases': {
    exactMatches: ['database', 'sql', 'nosql', 'data storage'],
    keywords: ['sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'database'],
    contentKeywords: ['query', 'table', 'database', 'schema', 'index', 'join'],
    frameworks: [
      'hibernate', 'sequelize', 'prisma', 'typeorm', 'mongoose',
      'sqlalchemy', 'entity framework'
    ],
    tools: [
      'mysql workbench', 'pgadmin', 'mongodb compass', 'dbeaver',
      'redis desktop manager', 'datagrip'
    ],
    concepts: [
      'acid', 'normalization', 'indexing', 'transactions',
      'sharding', 'replication', 'cap theorem'
    ]
  }
}

export function categorizeTopic(title: string, content: string, tags: string[]): string[] {
  const matchedTopics = new Set<string>();
  
  // Normalize input with special handling for AI variations
  const normalizedTitle = title.toLowerCase().replace(/\./g, '');
  const normalizedContent = content.toLowerCase().replace(/\./g, '');
  const normalizedTags = tags.map(tag => tag.toLowerCase().replace(/\./g, ''));

  // Special handling for AI-related terms
  const hasAITerms = (text: string) => {
    const aiPatterns = [
      /\bai\b/,
      /\ba\.i\b/,
      /artificial.?intelligence/,
      /\bagi\b/,
      /ai[- ](?:based|powered|driven|enabled)/
    ];
    return aiPatterns.some(pattern => pattern.test(text));
  };

  Object.entries(topicMatchers).forEach(([topic, matchers]) => {
    // Special handling for AI topic
    if (topic === 'artificial-intelligence' && 
        (hasAITerms(normalizedTitle) || 
         hasAITerms(normalizedContent) || 
         normalizedTags.some(tag => hasAITerms(tag)))) {
      matchedTopics.add(topic);
      return;
    }

    // Check exact matches in tags
    if (normalizedTags.some(tag => 
      matchers.exactMatches.includes(tag) || 
      matchers.keywords.includes(tag) ||
      matchers.frameworks.includes(tag) ||
      matchers.tools.includes(tag)
    )) {
      matchedTopics.add(topic);
      return;
    }

    // Check title for keywords and frameworks/tools
    if ([...matchers.keywords, ...matchers.frameworks, ...matchers.tools].some(
      keyword => normalizedTitle.includes(keyword)
    )) {
      matchedTopics.add(topic);
      return;
    }

    // Check content for keywords and concepts (with threshold)
    const allContentMatchers = [
      ...matchers.contentKeywords,
      ...matchers.concepts,
      ...matchers.frameworks,
      ...matchers.tools
    ];
    
    const contentKeywordMatches = allContentMatchers.filter(keyword => 
      normalizedContent.includes(keyword)
    ).length;

    if (contentKeywordMatches >= 3) { // Increased threshold due to more keywords
      matchedTopics.add(topic);
    }
  });

  return Array.from(matchedTopics);
} 