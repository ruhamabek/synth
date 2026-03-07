import type { SchemaMetadata, TableMeta } from "../lib/types.js";

export function escapeHTML(value: string) {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

export function baseStyles() {
	return `
    :root { color-scheme: light; }
    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif; margin: 0; padding: 0; background: #f8fafc; color: #0f172a; }
    header { padding: 16px 24px; border-bottom: 1px solid #cbd5e1; background: white; display: flex; justify-content: space-between; align-items: center; }
    nav a { margin-left: 12px; color: #0369a1; text-decoration: none; font-weight: 600; }
    main { max-width: 1080px; margin: 0 auto; padding: 20px; }
    .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; margin-bottom: 20px; }
    article { background: white; border: 1px solid #cbd5e1; border-radius: 10px; padding: 12px; }
    h1, h2, h3 { margin: 0 0 8px 0; }
    table { width: 100%; border-collapse: collapse; background: white; border: 1px solid #cbd5e1; border-radius: 10px; overflow: hidden; }
    th, td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: left; font-size: 14px; }
    th { background: #f1f5f9; }
    a { color: #0369a1; }
  `;
}

export function renderDashboardPage(metadata: SchemaMetadata) {
	const distinctSchemas = new Set(metadata.tables.map((table) => table.schema))
		.size;
	const estimatedRows = metadata.tables.reduce(
		(sum, table) => sum + table.estimatedRows,
		0,
	);
	const largestTables = [...metadata.tables]
		.sort((a, b) => b.estimatedRows - a.estimatedRows)
		.slice(0, 8);

	const rows = largestTables
		.map(
			(table) => `
      <tr>
        <td>${escapeHTML(table.schema)}.${escapeHTML(table.name)}</td>
        <td>${table.columns.length}</td>
        <td>${table.estimatedRows.toLocaleString()}</td>
        <td><a href="/tables/${encodeURIComponent(`${table.schema}.${table.name}`)}">Open</a></td>
      </tr>`,
		)
		.join("");

	return `
  <!doctype html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Synth Dashboard</title>
    <style>${baseStyles()}</style>
  </head>
  <body>
    <header>
      <h1>synth</h1>
      <nav><a href="/">Dashboard</a> <a href="/tables">Tables</a></nav>
    </header>
    <main>
      <section class="cards">
        <article><h2>${metadata.tableCount}</h2><p>Tables</p></article>
        <article><h2>${distinctSchemas}</h2><p>Schemas</p></article>
        <article><h2>${estimatedRows.toLocaleString()}</h2><p>Estimated Rows</p></article>
        <article><h2>${escapeHTML(metadata.database)}</h2><p>Database</p></article>
      </section>

      <section>
        <h3>Largest Tables</h3>
        <table>
          <thead>
            <tr><th>Table</th><th>Columns</th><th>Estimated Rows</th><th>View</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </section>

    </main>
  </body>
  </html>`;
}

export function renderTablesPage(metadata: SchemaMetadata) {
	const rows = metadata.tables
		.map(
			(table) => `
      <tr>
        <td>${escapeHTML(table.schema)}</td>
        <td>${escapeHTML(table.name)}</td>
        <td>${table.columns.length}</td>
        <td>${table.estimatedRows.toLocaleString()}</td>
        <td><a href="/tables/${encodeURIComponent(`${table.schema}.${table.name}`)}">Open</a></td>
      </tr>`,
		)
		.join("");

	return `
  <!doctype html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Synth Tables</title>
    <style>${baseStyles()}</style>
  </head>
  <body>
    <header>
      <h1>synth</h1>
      <nav><a href="/">Dashboard</a> <a href="/tables">Tables</a></nav>
    </header>
    <main>
      <table>
        <thead>
          <tr><th>Schema</th><th>Table</th><th>Columns</th><th>Estimated Rows</th><th>View</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </main>
  </body>
  </html>`;
}

export function renderTableDetailPage(table: TableMeta) {
	const rows = table.columns
		.map(
			(column) => `
      <tr>
        <td>${escapeHTML(column.name)}</td>
        <td>${escapeHTML(column.dataType)}</td>
        <td>${column.nullable ? "YES" : "NO"}</td>
        <td>${column.defaultValue ? escapeHTML(column.defaultValue) : "-"}</td>
      </tr>`,
		)
		.join("");

	return `
  <!doctype html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHTML(table.schema)}.${escapeHTML(table.name)}</title>
    <style>${baseStyles()}</style>
  </head>
  <body>
    <header>
      <h1>synth</h1>
      <nav><a href="/">Dashboard</a> <a href="/tables">Tables</a></nav>
    </header>
    <main>
      <section class="cards">
        <article><h2>${table.columns.length}</h2><p>Columns</p></article>
        <article><h2>${table.estimatedRows.toLocaleString()}</h2><p>Estimated Rows</p></article>
      </section>
      <table>
        <thead>
          <tr><th>Column</th><th>Type</th><th>Nullable</th><th>Default</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </main>
  </body>
  </html>`;
}
