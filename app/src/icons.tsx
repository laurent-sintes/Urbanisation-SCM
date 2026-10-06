import {
  Orbit, BriefcaseBusiness, Boxes, Warehouse, Handshake, ClipboardList, Scale,
  Route, Truck, Users, FileSignature, Package, BookOpen, Network, Layers, Box,
  FileText, Zap, Workflow, FolderTree, ScanLine, ArrowLeftRight, Eye, ClipboardCheck,
  ShieldCheck, BookmarkCheck, SearchCheck, SlidersHorizontal, MessageSquarePlus,
  BadgeCheck, GitBranch, RefreshCw, ListChecks, MapPin, Replace, PackagePlus,
  FilePlus2, FilePenLine, GitCompareArrows, Target, Calculator, Move, Gauge,
  MapPinned, ChartNoAxesCombined, ListTodo, CalendarCheck, PackageSearch,
  Download, ListFilter, Settings2, Compass, type LucideIcon,
} from 'lucide-react';
import type { AtlasNode } from './types';
import { capabilityNature, capabilityTypes, type CapabilityNature } from './capabilityTypes';
import { behaviorNature, behaviorTypes } from './behaviorTypes';

// Presentation only: exact published names, never inferred parents or business semantics.
const namedIcons: Record<string, LucideIcon> = {
  Supply: Orbit, 'Supply Chain Orchestration': Orbit, Case: BriefcaseBusiness, 'Business References': BookOpen, 'Authoritative Data': BookOpen,
  'Fulfillment Optimization': Target, 'Fulfillment Plan Decision': GitBranch,
  'Return Disposition Decision': PackageSearch,
  'Inventory Management': Warehouse, 'Inventory Tracking': ScanLine,
  'Record Inventory Movements': ArrowLeftRight, 'Inventory Visibility': Eye,
  Stocktaking: ClipboardCheck, 'Supply Protection': ShieldCheck, Reservation: BookmarkCheck,
  'Resource Availability and Commitments': Boxes,
  'Determine resource availability for a given use': SearchCheck,
  'Adjust resource commitments': SlidersHorizontal, 'Order Promising': Handshake,
  'Promise Proposal': MessageSquarePlus, 'Promise Confirmation': BadgeCheck,
  'Supply Assignment': GitBranch, 'Promise Revision': RefreshCw,
  'Allocation Eligibility Decision': ListChecks, 'Fulfillment Source Decision': MapPin,
  'Fulfillment Route Decision': Route, 'Product Substitution Decision': Replace,
  'Supply Creation Decision': PackagePlus, 'Order Management': ClipboardList,
  'Order Registration': FilePlus2, 'Order Revision': FilePenLine,
  'Order Visibility': Eye, 'Order Reconciliation': GitCompareArrows,
  'Operational Resource Balancing': Scale, 'Determine operational coverage targets': Target,
  'Net Requirements Calculation': Calculator, 'Determine resource redistribution': Move,
  'Execution Options': Route, 'Qualify locations and feasible services': MapPinned,
  'Execution Capacity Assessment': Gauge, 'Execution Option Assessment': ChartNoAxesCombined,
  'Execution Commitments and Facts': Truck, 'Execution Requirement Definition': ListTodo,
  'Execution Commitment Management': CalendarCheck, 'Execution Reconciliation': GitCompareArrows,
  'Expected Supply Tracking': PackageSearch, 'Party / Role': Users,
  Agreement: FileSignature, 'Product Reference': Package, Catalog: BookOpen, 'Product Catalog': BookOpen, Assortment: ListFilter,
  'Fulfillment Network': Network, 'Party / Role Ingestion': Download,
  'Agreement Ingestion': Download, 'Product Reference Ingestion': Download,
  'Catalog Ingestion': Download, 'Fulfillment Network Ingestion': Download,
};
const typeIcons: Record<string, LucideIcon> = {
  business_system: Network, domain: Boxes, area: Boxes, business_area: Boxes, capability: Workflow, behavior: ListFilter, reference: BookOpen, group: FolderTree,
  object: Box, document: FileText, event: Zap,
};
export function iconFor(node: AtlasNode): LucideIcon {
  if (node.kind === 'behavior') {
    const nature = behaviorNature(node);
    const icons: Record<string, LucideIcon> = { SlidersHorizontal, Route, Settings2, ScanLine, Compass, ArrowLeftRight, CalendarCheck };
    return nature ? icons[behaviorTypes[nature].icon] : ListFilter;
  }
  if (node.kind === 'capability') {
    if (node.referenceParentName) return ({ 'Product Reference': Package, 'Party / Role': Users,
      Catalog: BookOpen, 'Product Catalog': BookOpen, Assortment: ListFilter, Agreement: FileSignature, 'Fulfillment Network': Network, 'Service Catalog': ClipboardList } as Record<string, LucideIcon>)[node.referenceParentName] ?? BookOpen;
    const nature = capabilityNature(node);
    const icons: Record<(typeof capabilityTypes)[CapabilityNature]['icon'], LucideIcon> = {
      Zap, SlidersHorizontal, Eye, Workflow, CalendarCheck, ShieldCheck, GitBranch, ArrowLeftRight, BookOpen, Calculator,
    };
    return nature ? icons[capabilityTypes[nature].icon] : Box;
  }
  return namedIcons[node.name] ?? (node.groupRole === 'urbanism_level' ? Layers : typeIcons[node.kind]) ?? Box;
}
export function NodeIcon({ node, size = 18, framed = false }: { node: AtlasNode; size?: number; framed?: boolean }) {
  const Icon = iconFor(node);
  const tone = node.groupRole === 'urbanism_level' ? 'universe' : node.kind;
  return <span className={`node-icon tone-${tone} ${framed ? 'framed' : ''}`} aria-hidden="true" data-icon-kind={tone} data-capability-type={capabilityNature(node)} data-behavior-type={behaviorNature(node)} data-reference-icon={node.referenceParentName}>
    <Icon size={size} strokeWidth={1.7} />
  </span>;
}
