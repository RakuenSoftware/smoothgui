import { useRef, useState } from 'react';
import {
  Button,
  Drawer,
  InlineStatus,
  EmptyState,
  Field,
  KeyValue,
  StatusDot,
  Switch,
  PageHeader,
  ChipSelect,
  Disclosure,
  DiffViewer,
  TypingIndicator,
  AutoGrowTextarea,
  Modal,
  DataTable,
  ErrorBoundary,
  CoachMark,
  Wizard,
  useSeenState,
  tokens,
  type Column,
  type WizardStep,
} from '../index';

interface DemoRow {
  name: string;
  count: number;
}

const ROWS: DemoRow[] = [
  { name: 'alpha', count: 3 },
  { name: 'beta', count: 41 },
];

const COLUMNS: Column<DemoRow>[] = [
  { key: 'name', label: 'Name' },
  { key: 'count', label: 'Count', align: 'right', render: (r) => r.count.toLocaleString() },
];

interface WizState {
  ready: boolean;
}

const STEPS: WizardStep<WizState>[] = [
  { id: 'one', title: 'First', render: () => <p>Step one body.</p> },
  {
    id: 'two',
    title: 'Optional',
    optional: true,
    isComplete: (s) => s.ready,
    render: (ctx) => <Button variant="primary" onClick={ctx.advance}>Continue</Button>,
    ownsPrimaryAction: true,
  },
];

/** A dev-only showcase that exercises every extracted primitive through the
 * public entrypoint. Doubles as a compile-time smoke test of the public API. */
export default function NewComponentsDemo() {
  const [text, setText] = useState('');
  const [on, setOn] = useState(true);
  const [roles, setRoles] = useState<string[]>(['admin']);
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [composerText, setComposerText] = useState('');
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const seen = useSeenState('demo_coachmark_seen');

  return (
    <div style={{ position: 'relative', padding: 24, display: 'grid', gap: 16 }}>
      <CoachMark
        id="/demo"
        content={{ title: 'Demo tab', body: ['This is a coach-mark.'], seeAlso: '/other' }}
        storageKey="demo_coachmark_seen"
        onNavigate={(to) => console.log('go', to)}
        resolveSeeAlsoTitle={(to) => `Title for ${to}`}
      />

      <PageHeader
        title="New components"
        count={ROWS.length}
        actions={
          <>
            <Button size="sm" onClick={() => seen.resetAll()}>Reset tours</Button>
            <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>Open modal</Button>
            <Button variant="ghost" size="sm" onClick={() => setWizardOpen(true)}>Open wizard</Button>
            <Button size="sm" busy>Working…</Button>
          </>
        }
        status={<InlineStatus status={{ kind: 'ok', msg: 'All good' }} />}
      />

      <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <StatusDot status="ok" label="healthy" />
        <StatusDot status="down" label="offline" />
        <Switch checked={on} onChange={setOn} label="Enabled" />
        <TypingIndicator />
      </div>

      <Field label="Message" help="Auto-grows as you type." hint="(optional)">
        <AutoGrowTextarea value={text} onChange={setText} onSubmit={() => console.log('submit')} />
      </Field>

      <ChipSelect label="roles" options={['admin', 'viewer']} selected={roles} onChange={setRoles} wildcard="all" emptyHint="(none = all)" />

      <div>
        <KeyValue label="Version" value="0.7.0" mono />
        <KeyValue label="Rows" value={ROWS.length} />
      </div>

      <Disclosure summary="Advanced" accent={tokens.primary}>
        <DiffViewer diff={'@@ -1 +1 @@\n-old\n+new'} />
      </Disclosure>

      <ErrorBoundary label="demo table">
        <DataTable columns={COLUMNS} rows={ROWS} rowKey={(r) => r.name} onRowClick={(r) => console.log(r)} empty={<EmptyState message="No rows" />} />
      </ErrorBoundary>

      <div style={{ position: 'relative', height: 160, border: '1px solid #eee', borderRadius: 6 }}>
        <Drawer
          open={drawerOpen}
          onToggle={() => setDrawerOpen((o) => !o)}
          title="Rules"
          badge={ROWS.length}
          alert={<span style={{ color: '#e65100', fontWeight: 600 }}>2 pending</span>}
          subtitle="epoch 7"
        >
          <div>Drawer body content.</div>
        </Drawer>
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <AutoGrowTextarea ref={composerRef} value={composerText} onChange={setComposerText} placeholder="Auto-grow…" style={{ flex: 1 }} />
        <Button size="sm" onClick={() => composerRef.current?.focus()}>Focus</Button>
      </div>

      <EmptyState message="Nothing here yet" icon="📭" action={<Button size="sm">Create one</Button>} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Demo modal" footer={<Button variant="primary" onClick={() => setModalOpen(false)}>Done</Button>}>
        <p>Arbitrary modal content.</p>
      </Modal>

      <Wizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        title="Demo wizard"
        steps={STEPS}
        state={{ ready: on }}
        freezeCompletedAtOpen
        renderSummary={({ close }) => (
          <div>
            <p>Summary screen.</p>
            <Button variant="primary" onClick={close}>Finish</Button>
          </div>
        )}
      />
    </div>
  );
}
