import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  fitFlowCamera,
  flowRouteInViewport,
  flowTargetFocus,
  resizeFlowCamera,
  standardFlowCamera,
  visibleFlowHotspotAnchor,
} from './src/flowMapViewport.ts';

const bounds = { width: 390, height: 180 };
const camera = { x: -400, y: -300, zoom: 1 };

test('locked flow framing fits the actual canvas after shrinking, expanding and fullscreen round trips', () => {
  const world = { width: 4263, height: 2365, boxes: [] };
  for (const size of [
    { width: 1061, height: 580 },
    { width: 735, height: 213 },
    { width: 341, height: 333 },
    { width: 796, height: 100 },
    { width: 1440, height: 850 },
  ]) {
    for (const framing of ['width', 'all']) {
      const fitted = fitFlowCamera(world, size, framing);
      assert.ok(fitted.x >= 0);
      assert.ok(fitted.x + world.width * fitted.zoom <= size.width);
      if (framing === 'all') {
        assert.ok(fitted.y >= 0);
        assert.ok(fitted.y + world.height * fitted.zoom <= size.height);
      }
    }
  }
});

const territory = (id, kind, geometry = {}, parentId) =>
  Object.freeze({
    id,
    node: Object.freeze({ kind }),
    x: 32,
    y: 32,
    width: 288,
    height: 600,
    headerHeight: kind === 'business_system' ? 104 : kind === 'domain' ? 88 : 80,
    depth: parentId ? 1 : 0,
    ...geometry,
    ...(parentId ? { parentId } : {}),
  });
const screenOrigin = (box, camera) => ({ x: box.x * camera.zoom + camera.x, y: box.y * camera.zoom + camera.y });

test('Standard keeps subdomains readable in a large system instead of fitting the complete world', () => {
  const domain = territory('domain', 'domain', { width: 20000, height: 40000 });
  const area = territory('area', 'area', {}, domain.id);
  const boxes = Object.freeze([domain, area]);
  const world = JSON.stringify(boxes);
  const standard = standardFlowCamera(boxes, { width: 1059, height: 635 }, 'system-business-operations');
  assert.ok(area.width * standard.zoom >= 200 && area.width * standard.zoom <= 240);
  assert.ok(standard.zoom > 0.5);
  assert.ok(domain.headerHeight * standard.zoom >= 30);
  assert.deepEqual(screenOrigin(domain, standard), { x: 24, y: 24 });
  assert.deepEqual(
    standardFlowCamera(
      [...boxes, territory('remote', 'area', { x: 100000, y: 100000 }, domain.id)],
      { width: 1059, height: 635 },
      'system-business-operations',
    ),
    standard,
  );
  assert.equal(JSON.stringify(boxes), world);
});

test('Standard at enterprise scale protects the enclosing system headings when domains are wide', () => {
  const system = territory('system', 'business_system', { width: 10000, height: 30000 });
  const domain = territory('domain', 'domain', { width: 1200 }, system.id);
  const standard = standardFlowCamera([system, domain], { width: 1059, height: 635 }, '@root');
  assert.ok(system.headerHeight * standard.zoom >= 30 - 1e-9);
  assert.ok(domain.width * standard.zoom >= 200);
  assert.ok(standard.zoom > 0.07 && standard.zoom <= 1.2);
  assert.deepEqual(screenOrigin(system, standard), { x: 24, y: 24 });
});

test('enterprise Standard reveals named subdomains at 120px without changing the world on mobile', () => {
  const system = territory('system', 'business_system', { width: 10000, height: 30000, headerHeight: 200 });
  const domain = territory('domain', 'domain', { x: 46, y: 232, width: 2000, height: 5000 }, system.id);
  const area = territory('area', 'area', { x: 60, y: 320, height: 80 }, domain.id);
  const other = territory('other', 'area', { x: 800, y: 320, height: 80 }, domain.id);
  const wide = territory('wide', 'area', { x: 60, y: 1000, width: 1600, height: 600 }, domain.id);
  const boxes = Object.freeze([system, domain, area, other, wide]);
  const original = JSON.stringify(boxes);
  const desktop = standardFlowCamera(boxes, { width: 1440, height: 1000 }, '@root');
  const mobile = standardFlowCamera(boxes, { width: 320, height: 480 }, '@root');
  assert.ok(area.width * desktop.zoom >= 120 - 1e-9);
  assert.ok(area.height * desktop.zoom >= 32);
  assert.ok(domain.headerHeight * desktop.zoom >= 30);
  assert.equal(mobile.zoom, desktop.zoom);
  assert.equal(JSON.stringify(boxes), original);
  assert.deepEqual(screenOrigin(system, desktop), { x: 24, y: 24 });
  const shorterHeader = { ...domain, headerHeight: 40 };
  const protectedHeader = standardFlowCamera([system, shorterHeader, area], { width: 1440, height: 1000 }, '@root');
  assert.ok(shorterHeader.headerHeight * protectedHeader.zoom >= 30);
});

test('Standard starts Supply on its fixed core and shows Business Areas at a natural width', () => {
  const integration = territory('subdomain-integration', 'area', { x: 734, y: 512 });
  const plan = territory('domain-plan', 'area', { x: 1162, y: 512 });
  const inventory = territory('D01', 'area', { x: 1590, y: 512 });
  const references = territory('business-references', 'area', { x: 32, y: 32 });
  const ba = territory('ba', 'business_area', { x: 748, y: 592, width: 260, height: 116 }, integration.id);
  const boxes = [references, integration, plan, inventory, ba];
  const standard = standardFlowCamera(boxes, { width: 1059, height: 635 }, 'supply-chain-orchestration');
  assert.ok(Math.abs(ba.width * standard.zoom - 220) < 0.001);
  assert.deepEqual(screenOrigin(integration, standard), { x: 24, y: 24 });
  assert.deepEqual(
    standardFlowCamera([...boxes].reverse(), { width: 1059, height: 635 }, 'supply-chain-orchestration'),
    standard,
  );
  assert.deepEqual(standardFlowCamera(boxes, { width: 1059, height: 635 }), standard);
});

test('a Supply corridor nested inside a system does not replace the first system territory', () => {
  const commerce = territory('commerce', 'domain', { x: 32, y: 32, width: 700 });
  const supply = territory('supply-chain-orchestration', 'domain', { x: 500, y: 1200, width: 4000 });
  const integration = territory('subdomain-integration', 'area', { x: 734, y: 1512 }, supply.id);
  const plan = territory('domain-plan', 'area', { x: 1162, y: 1512 }, supply.id);
  const standard = standardFlowCamera(
    [plan, supply, integration, commerce],
    { width: 1059, height: 635 },
    'system-business-operations',
  );
  assert.deepEqual(screenOrigin(commerce, standard), { x: 24, y: 24 });
});

test('Standard starts the current Supply publication at Planning and Inventory without Integration', () => {
  const references = territory('business-references', 'area', { x: 32, y: 32 });
  const policies = territory('subdomain-policies', 'area', { x: 734, y: 32 });
  const plan = territory('domain-plan', 'area', { x: 734, y: 512 });
  const inventory = territory('D01', 'area', { x: 1162, y: 512 });
  const ba = territory('ba', 'business_area', { x: 748, y: 592, width: 260, height: 60 }, plan.id);
  const boxes = Object.freeze([references, policies, plan, inventory, ba]);
  const world = JSON.stringify(boxes);
  const standard = standardFlowCamera(boxes, { width: 1059, height: 635 }, 'supply-chain-orchestration');
  assert.deepEqual(screenOrigin(plan, standard), { x: 24, y: 24 });
  assert.ok(Math.abs(ba.width * standard.zoom - 220) < 0.001);
  assert.deepEqual(
    standardFlowCamera([...boxes].reverse(), { width: 1059, height: 635 }, 'supply-chain-orchestration'),
    standard,
  );
  assert.equal(JSON.stringify(boxes), world);
  const partial = standardFlowCamera(
    [references, plan, ba],
    { width: 1059, height: 635 },
    'supply-chain-orchestration',
  );
  assert.deepEqual(screenOrigin(references, partial), { x: 24, y: 24 });
});

test('Standard uses the same natural scale on mobile and desktop; resize preserves the current camera', () => {
  const area = territory('area', 'area', { x: 400, y: 500 });
  const ba = territory('ba', 'business_area', { width: 260, height: 116 }, area.id);
  const desktop = { width: 1059, height: 635 },
    mobile = { width: 288, height: 180 };
  const boxes = Object.freeze([area, ba]);
  const natural = standardFlowCamera(boxes, desktop);
  const mobileStandard = standardFlowCamera(boxes, mobile);
  assert.equal(mobileStandard.zoom, natural.zoom);
  assert.ok(screenOrigin(area, mobileStandard).x >= 0 && screenOrigin(area, mobileStandard).x <= 24);
  assert.ok(screenOrigin(area, mobileStandard).y >= 0 && screenOrigin(area, mobileStandard).y <= 18.001);
  const panned = { ...natural, x: natural.x - 600, y: natural.y - 400 };
  const resized = resizeFlowCamera(panned, desktop, mobile);
  const restored = resizeFlowCamera(resized, mobile, desktop);
  assert.ok(Math.abs(restored.x - panned.x) < 1e-9 && Math.abs(restored.y - panned.y) < 1e-9);
  assert.equal(resized.zoom, natural.zoom);
  assert.notDeepEqual(resized, mobileStandard);
});

test('a standalone Business Area starts at 100%; historical terminal territories get a readable fallback', () => {
  const ba = territory('ba', 'business_area', { width: 260, height: 116 });
  assert.deepEqual(standardFlowCamera([ba], { width: 390, height: 180 }, ba.id), { x: -8, y: -14, zoom: 1 });
  const terminal = territory('historical', 'area', { width: 288, height: 132 });
  const fallback = standardFlowCamera([terminal], { width: 390, height: 180 }, terminal.id);
  assert.ok(terminal.width * fallback.zoom >= 200 && terminal.width * fallback.zoom <= 240);
  assert.deepEqual(standardFlowCamera([], { width: 390, height: 180 }), { x: 0, y: 0, zoom: 1 });
});

test('a hotspot remains anchored to the visible part of a large centered territory', () => {
  const box = { x: 0, y: 0, width: 2000, height: 2000 };
  assert.deepEqual(visibleFlowHotspotAnchor(box, camera, bounds), { x: 364, y: 26 });
  assert.equal(visibleFlowHotspotAnchor({ ...box, x: 3000 }, camera, bounds), undefined);
});

test('a marker cannot project onto a neighboring territory outside its footprint', () => {
  const box = { x: 600, y: 350, width: 100, height: 100 };
  const point = visibleFlowHotspotAnchor(box, camera, bounds);
  assert.ok(point.x >= 200 && point.x <= 300 && point.y >= 50 && point.y <= 150);
  assert.equal(visibleFlowHotspotAnchor(box, { x: -1000, y: -300, zoom: 1 }, bounds), undefined);
});

test('partially visible arrows stay reachable and fully offscreen arrows are excluded', () => {
  assert.equal(
    flowRouteInViewport(
      [
        { x: -50, y: 90 },
        { x: 500, y: 90 },
      ],
      bounds,
    ),
    true,
  );
  assert.equal(
    flowRouteInViewport(
      [
        { x: -50, y: -40 },
        { x: 500, y: -40 },
      ],
      bounds,
    ),
    false,
  );
  assert.equal(
    flowRouteInViewport(
      [
        { x: -50, y: 90 },
        { x: -20, y: 90 },
      ],
      bounds,
    ),
    false,
  );
  assert.equal(flowRouteInViewport([], bounds), false);
});

test('resizing and fullscreen keep the world point under the center unchanged', () => {
  const previous = { width: 1440, height: 1000 };
  const next = { width: 320, height: 180 };
  const resized = resizeFlowCamera(camera, previous, next);
  assert.equal((previous.width / 2 - camera.x) / camera.zoom, (next.width / 2 - resized.x) / resized.zoom);
  assert.equal((previous.height / 2 - camera.y) / camera.zoom, (next.height / 2 - resized.y) / resized.zoom);
  assert.equal(resized.zoom, camera.zoom);
  assert.deepEqual(resizeFlowCamera(resized, next, previous), camera);
});

test('a selected Business Area keeps its heading above the controls on a short landscape canvas', () => {
  const box = Object.freeze({ node: { kind: 'business_area' }, x: 200, y: 400, width: 260, height: 116 });
  const bounds = { width: 602, height: 114 };
  const focus = flowTargetFocus(box, bounds);
  assert.ok(focus.zoom >= 0.3 && box.width * focus.zoom >= 170 && box.height * focus.zoom >= 42);
  const top = bounds.height / 2 + (box.y - focus.y) * focus.zoom;
  assert.ok(top >= 0 && top <= 32);
});

test('the top-left heading of a large selected system stays inside a narrow camera', () => {
  const box = Object.freeze({ x: 200, y: 400, width: 3000, height: 4000 });
  const focus = flowTargetFocus(box, bounds);
  const left = bounds.width / 2 + (box.x - focus.x) * focus.zoom;
  const top = bounds.height / 2 + (box.y - focus.y) * focus.zoom;
  assert.ok(left >= 0 && left <= 24);
  assert.ok(top >= 0 && top <= 32);
});

test('a terminal perimeter keeps its top-left heading in view on a short canvas', () => {
  const box = Object.freeze({ x: 200, y: 400, width: 1552, height: 1832 });
  const bounds = { width: 341, height: 184 };
  const focus = flowTargetFocus(box, bounds);
  const top = bounds.height / 2 + (box.y - focus.y) * focus.zoom;
  assert.ok(top >= 0 && top <= 32);
});
