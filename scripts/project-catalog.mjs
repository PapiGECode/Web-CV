import { projects } from '../content/projects.mjs';
import { renderProjectPhone } from './project-phones.mjs';
export { projects };
export const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

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
    ${phone ? `<div class="pp-visual cs-hero-card">${phone}</div>` : ''}
  </header>
  <nav class="pp-toc" aria-label="En este proyecto"><a href="#${prefix}overview">Visión general</a><a href="#${prefix}approach">Mi participación</a><a href="#${prefix}implementation">Detalles</a></nav>
  <section id="${prefix}overview" class="pp-section"><p class="pp-label">Visión general</p><h2>El proyecto.</h2><p class="pp-copy">${e(project.overview)}</p></section>
  <section id="${prefix}approach" class="pp-section"><p class="pp-label">Mi participación</p><h2>${e(project.role)}</h2><p class="pp-copy">${e(project.approach)}</p></section>
  <section id="${prefix}implementation" class="pp-section"><p class="pp-label">Detalles</p><h2>Trabajo y enfoque.</h2><div class="pp-grid">${details}</div><div class="pp-stack">${project.tags.map(tag => `<span>${e(tag)}</span>`).join('')}</div></section>
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
