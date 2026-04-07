interface TokenTableProps {
  rows: Array<{ key: string; value: string }>;
}

export function TokenTable({ rows }: TokenTableProps) {
  return (
    <div className="token-table-wrap">
      <table className="token-table">
        <thead>
          <tr>
            <th>Token</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key}>
              <td>
                <div className="token-name-cell">
                  <span className="token-color-dot" style={{ backgroundColor: row.value }} aria-hidden="true" />
                  <span>{row.key}</span>
                </div>
              </td>
              <td>
                <code>{row.value}</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
