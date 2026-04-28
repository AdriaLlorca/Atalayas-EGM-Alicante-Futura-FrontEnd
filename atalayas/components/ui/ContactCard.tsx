
function ContactCard({ service }: { service: any; }) {
  return (
    <div style={{
      background: '#fff', padding: '28px', borderRadius: '24px',
      border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
    }}>
      <p style={{ fontSize: '11px', fontWeight: 800, color: '#86868b', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '20px' }}>
        Información de contacto
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
        {service.providerName && <ContactRow icon="🏷️" label="Proveedor" value={service.providerName} />}
        {service.phone && <ContactRow icon="📞" label="Teléfono" value={service.phone} />}
        {service.email && <ContactRow icon="✉️" label="Email" value={service.email} href={`mailto:${service.email}`} />}
        {service.address && <ContactRow icon="📍" label="Dirección" value={service.address} />}
        {service.schedule && <ContactRow icon="🕐" label="Horario" value={service.schedule} />}
        {service.price && <ContactRow icon="💶" label="Precio" value={service.price} />}
      </div>

      {service.externalUrl && (
        <a
          href={service.externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block', width: '100%', padding: '16px', borderRadius: '14px',
            background: '#0071e3', color: '#fff', textAlign: 'center',
            fontSize: '15px', fontWeight: 600, textDecoration: 'none',
            boxShadow: '0 4px 15px rgba(0,113,227,0.2)', transition: 'transform 0.2s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.01)')}
          onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        > 
        Más información
        </a>
      )}
    </div>
  );
}

function ContactRow({ icon, label, value, href }: { icon: string; label: string; value: string; href?: string }) {
  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
      <span style={{ fontSize: '16px', flexShrink: 0, marginTop: '1px' }}>{icon}</span>
      <div>
        <p style={{ fontSize: '11px', fontWeight: 700, color: '#86868b', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>{label}</p>
        {href ? (
          <a href={href} style={{ fontSize: '14px', color: '#0071e3', fontWeight: 500, textDecoration: 'none' }}>{value}</a>
        ) : (
          <p style={{ fontSize: '14px', color: '#1d1d1f', fontWeight: 500, margin: 0 }}>{value}</p>
        )}
      </div>
    </div>
  );
}

export default ContactCard;
