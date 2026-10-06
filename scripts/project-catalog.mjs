import { projects } from '../content/projects.mjs';
import { renderProjectPhone } from './project-phones.mjs';
export { projects };
export const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

export function renderProjectIdentity(project) {
  const art = {
    kicord: '<img src="/assets/kicord-mark.webp" width="512" height="512" alt="" loading="lazy"><strong>KiCord<span>YOUR DISCORD. REFINED.</span></strong>',
    portfolio: '<strong>PABLO<br>SCHEFER<span>DESIGN / CODE / CARE</span></strong>',
    kernelos: '<img src="/assets/kernelos-logo.webp" width="160" height="160" alt="" loading="lazy"><strong>KernelOS<span>WINDOWS / GAMING / COMMUNITY</span></strong>',
    thiagoiutu: '<strong>THIAGO<br><em>IUTU.</em><span>ARCHIVO · PRESENTE · COMUNIDAD</span></strong>',
    robleis: '<img src="/assets/robleis-wordmark.svg" width="1511" height="143" alt="" loading="lazy"><span class="project-art-note">UN UNIVERSO / UN PROYECTO WEB</span>',
    'thiago-community': '<img class="project-art-cover" src="/assets/thiago-community-banner.webp" width="1670" height="942" alt="" loading="lazy"><span class="project-art-note">THIAGO COMMUNITY / BOT</span>',
    'papigegamer-web': '<img src="/assets/papige-logo.webp" width="360" height="360" alt="" loading="lazy"><strong>PapiGECode<span>SOFTWARE & EXPERIMENTS</span></strong>',
  };
  return `<div class="project-art project-art-${project.slug}" aria-hidden="true">${art[project.slug] || escapeHTML(project.title)}</div>`;
}

export function renderProjectBody(project, modal = false) {
  const e = escapeHTML;
  const links = project.links.map(link => `<a class="btn btn-solid" href="${e(link.url)}" target="_blank" rel="noopener noreferrer"><span class="btn-t">${e(link.label)} ↗</span></a>`).join('');
  const details = project.details.map(detail => `<article class="pp-card"><h3>${e(detail.title)}</h3><p>${e(detail.text)}</p></article>`).join('');
  const phone = project.phone ? renderProjectPhone(project.phone, `${modal ? 'modal' : 'page'}-${project.slug}`) : '';
  const prefix = modal ? 'case-' : '';
  return `<header class="pp-hero cs-hero">
    <div>
      <p class="pp-kicker">${e(project.category)}</p>
      <h1 class="pp-title cs-title long">${e(project.title)}</h1>
      <p class="pp-tagline">${e(project.summary)}</p>
      <div class="pp-status">${e(project.status)}</div>
      <div class="pp-actions">${links}<a class="btn btn-ghost" href="${modal ? '/projects/' + project.slug : '/#work'}"><span class="btn-t">${modal ? 'URL permanente' : 'Volver a proyectos'}</span></a></div>
    </div>
    ${renderProjectIdentity(project)}
  </header>
  <nav class="pp-toc" aria-label="En este proyecto"><a href="#${prefix}overview">Visión general</a><a href="#${prefix}approach">Mi participación</a><a href="#${prefix}implementation">Detalles</a></nav>
  <section id="${prefix}overview" class="pp-section"><p class="pp-label">Visión general</p><h2>El proyecto.</h2><p class="pp-copy">${e(project.overview)}</p></section>
  <section id="${prefix}approach" class="pp-section"><p class="pp-label">Mi participación</p><h2>${e(project.role)}</h2><p class="pp-copy">${e(project.approach)}</p></section>
  <section id="${prefix}implementation" class="pp-section"><p class="pp-label">Detalles</p><h2>Trabajo y enfoque.</h2><div class="pp-grid">${details}</div><div class="pp-stack">${project.tags.map(tag => `<span>${e(tag)}</span>`).join('')}</div></section>
  ${phone ? `<details class="project-demo"><summary>Explorar la web real <span>Vista móvil ↗</span></summary><div class="pp-visual">${phone}</div></details>` : ''}
  <a class="pp-next" href="/projects/${e(project.next)}"><span>Continuar explorando</span><strong>Siguiente proyecto ↗</strong></a>`;
}

export function renderProjectPage(template, project) {
  const jsonld = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Article', headline: project.title, description: project.summary, url: `https://www.pabloschefer.com/projects/${project.slug}`, author: { '@type': 'Person', name: 'Pablo Schefer Orduña' } }).replace(/</g, '\\u003c');
  const values = { title: escapeHTML(project.title), summary: escapeHTML(project.summary), slug: project.slug, category: escapeHTML(project.category), jsonld, body: renderProjectBody(project) };
  return template.replace(/{{(\w+)}}/g, (_, key) => values[key]);
}
export function renderCaseTemplates() {
  return projects.map(project => `<template data-project-case="${project.id}" data-title="${escapeHTML(project.title)}" data-number="${project.number}">${renderProjectBody(project, true)}</template>`).join('');
}

export function renderProjectIndex() {
  const e = escapeHTML;
  return `<div class="stack project-index">${projects.map(project => `
    <article class="panel work-entry" aria-labelledby="work-${project.slug}">
      <div class="shell work-layout">
        <div class="panel-info">
          <p class="panel-num">${project.number} / ${e(project.category)}</p>
          <h3 class="panel-title" id="work-${project.slug}"><a href="/projects/${project.slug}" data-open-case="${project.id}">${e(project.title)}</a></h3>
          <p class="work-role">${e(project.role)}</p>
          <p class="panel-desc">${e(project.summary)}</p>
          <p class="work-status">${e(project.status)}</p>
          <div class="panel-tags">${project.tags.map(tag => `<span class="panel-tag">${e(tag)}</span>`).join('')}</div>
          <div class="panel-links"><a class="btn btn-solid" href="/projects/${project.slug}" data-open-case="${project.id}"><span class="btn-t">Explorar proyecto ↗</span></a></div>
        </div>
        ${renderProjectIdentity(project)}
      </div>
    </article>`).join('')}</div>`;
}
