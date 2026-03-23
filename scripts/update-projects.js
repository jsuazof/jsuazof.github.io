#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

const GITHUB_USERNAME = 'jsuazof';
const CONTENT_DIR = './src/content/store';

// Configuración de filtros
const CONFIG = {
  minStars: 0,
  excludeRepos: ['jsuazof.github.io', 'jsuazof'], // Excluir repos específicos
  includeLanguages: ['JavaScript', 'TypeScript', 'Java', 'Python', 'HTML', 'CSS', 'Vue', 'React', 'HCL'],
  priorityLanguages: ['Vue', 'Python', 'HCL', 'JavaScript', 'TypeScript'], // Lenguajes prioritarios
  maxRepos: 15
};

async function fetchGitHubRepos() {
  try {
    const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=50`);
    if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching GitHub repos:', error);
    process.exit(1);
  }
}

function filterRepos(repos) {
  const filtered = repos
    .filter(repo => !repo.fork) // No forks
    .filter(repo => !CONFIG.excludeRepos.includes(repo.name))
    .filter(repo => repo.stargazers_count >= CONFIG.minStars)
    .filter(repo => !CONFIG.includeLanguages.length || CONFIG.includeLanguages.includes(repo.language));
    // Removido el filtro de descripción obligatoria

  // Priorizar proyectos Vue y con topics relacionados
  return filtered
    .sort((a, b) => {
      const aIsVue = CONFIG.priorityLanguages.includes(a.language) || 
                     (a.topics && a.topics.some(topic => topic.includes('vue')));
      const bIsVue = CONFIG.priorityLanguages.includes(b.language) || 
                     (b.topics && b.topics.some(topic => topic.includes('vue')));
      
      if (aIsVue && !bIsVue) return -1;
      if (!aIsVue && bIsVue) return 1;
      
      return b.stargazers_count - a.stargazers_count || new Date(b.updated_at) - new Date(a.updated_at);
    })
    .slice(0, CONFIG.maxRepos);
}

function generateMarkdown(repo) {
  return `---
title: "${repo.name.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}"
description: "${repo.description || 'Proyecto de desarrollo'}"
custom_link_label: "Ver Código"
custom_link: "${repo.html_url}"
updatedDate: "${repo.updated_at}"
pricing: "Open Source"
badge: "${repo.language || 'Code'}"
checkoutUrl: "${repo.html_url}"
heroImage: "../../assets/images/itemPreview.webp"
---

## ${repo.name.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}

${repo.description || 'Proyecto de desarrollo'}

### 🚀 Características

- **Lenguaje principal**: ${repo.language || 'Mixed'}
- **Estrellas**: ${repo.stargazers_count}
- **Última actualización**: ${new Date(repo.updated_at).toLocaleDateString('es-ES')}
${repo.topics && repo.topics.length ? `- **Tecnologías**: ${repo.topics.join(', ')}` : ''}

### 📋 Descripción

${repo.description || 'Este proyecto demuestra habilidades de desarrollo y mejores prácticas de programación.'}

${repo.homepage ? `### 🌐 Demo\n[Ver proyecto en vivo](${repo.homepage})` : ''}

### 💻 Repositorio

[Ver código en GitHub](${repo.html_url})
`;
}

async function updateProjects() {
  console.log('🔄 Actualizando proyectos desde GitHub...');
  
  const repos = await fetchGitHubRepos();
  const filteredRepos = filterRepos(repos);
  
  console.log(`📊 Encontrados ${repos.length} repositorios, seleccionados ${filteredRepos.length}`);

  // Crear directorio si no existe
  await fs.mkdir(CONTENT_DIR, { recursive: true });

  // Limpiar proyectos auto-generados anteriores
  const existingFiles = await fs.readdir(CONTENT_DIR);
  for (const file of existingFiles) {
    if (file.startsWith('auto-') && file.endsWith('.md')) {
      await fs.unlink(path.join(CONTENT_DIR, file));
    }
  }

  // Generar nuevos archivos
  for (const repo of filteredRepos) {
    const filename = `auto-${repo.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.md`;
    const filepath = path.join(CONTENT_DIR, filename);
    const content = generateMarkdown(repo);
    
    await fs.writeFile(filepath, content);
    console.log(`✅ Creado: ${filename}`);
  }

  console.log(`🎉 Proyectos actualizados exitosamente!`);
  console.log(`📁 Archivos generados en: ${CONTENT_DIR}`);
}

updateProjects().catch(console.error);