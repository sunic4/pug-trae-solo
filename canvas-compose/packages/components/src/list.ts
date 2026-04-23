import { Compimport { ComposeNode } from '@canvas-compose/composer';import { ComposeNode } from '@canvas-compose/composer';

export interface ListItem {
  key: string;
  content: Compimport { ComposeNode } from '@canvas-compose/composer';

export interface ListItem {
  key: string;
  content: ComposeNode;
}

export interface ListProps {
  items: ListItem[]import { ComposeNode } from '@canvas-compose/composer';

export interface ListItem {
  key: string;
  content: ComposeNode;
}

export interface ListProps {
  items: ListItem[];
  direction?: 'vertical' | 'horizontal';
  padding?: number;
import { ComposeNode } from '@canvas-compose/composer';

export interface ListItem {
  key: string;
  content: ComposeNode;
}

export interface ListProps {
  items: ListItem[];
  direction?: 'vertical' | 'horizontal';
  padding?: number;
  spacing?: number;
  x?: number;
  y?: number;
  widthimport { ComposeNode } from '@canvas-compose/composer';

export interface ListItem {
  key: string;
  content: ComposeNode;
}

export interface ListProps {
  items: ListItem[];
  direction?: 'vertical' | 'horizontal';
  padding?: number;
  spacing?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export class List extends Composeimport { ComposeNode } from '@canvas-compose/composer';

export interface ListItem {
  key: string;
  content: ComposeNode;
}

export interface ListProps {
  items: ListItem[];
  direction?: 'vertical' | 'horizontal';
  padding?: number;
  spacing?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export class List extends ComposeNode {
  constructor(public props: ListProps) {
    super();
import { ComposeNode } from '@canvas-compose/composer';

export interface ListItem {
  key: string;
  content: ComposeNode;
}

export interface ListProps {
  items: ListItem[];
  direction?: 'vertical' | 'horizontal';
  padding?: number;
  spacing?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export class List extends ComposeNode {
  constructor(public props: ListProps) {
    super();
    this.updateItems();
  }

  private updateItems() {
    //import { ComposeNode } from '@canvas-compose/composer';

export interface ListItem {
  key: string;
  content: ComposeNode;
}

export interface ListProps {
  items: ListItem[];
  direction?: 'vertical' | 'horizontal';
  padding?: number;
  spacing?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export class List extends ComposeNode {
  constructor(public props: ListProps) {
    super();
    this.updateItems();
  }

  private updateItems() {
    // 清空现有子元素
    this.children = [];
    // 添加新的子元素
import { ComposeNode } from '@canvas-compose/composer';

export interface ListItem {
  key: string;
  content: ComposeNode;
}

export interface ListProps {
  items: ListItem[];
  direction?: 'vertical' | 'horizontal';
  padding?: number;
  spacing?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export class List extends ComposeNode {
  constructor(public props: ListProps) {
    super();
    this.updateItems();
  }

  private updateItems() {
    // 清空现有子元素
    this.children = [];
    // 添加新的子元素
    this.props.items.forEach(item => {
      this.addChild(item.content);
    });import { ComposeNode } from '@canvas-compose/composer';

export interface ListItem {
  key: string;
  content: ComposeNode;
}

export interface ListProps {
  items: ListItem[];
  direction?: 'vertical' | 'horizontal';
  padding?: number;
  spacing?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export class List extends ComposeNode {
  constructor(public props: ListProps) {
    super();
    this.updateItems();
  }

  private updateItems() {
    // 清空现有子元素
    this.children = [];
    // 添加新的子元素
    this.props.items.forEach(item => {
      this.addChild(item.content);
    });
  }

  measure(constraints: { minWidth: number; maxWidth:import { ComposeNode } from '@canvas-compose/composer';

export interface ListItem {
  key: string;
  content: ComposeNode;
}

export interface ListProps {
  items: ListItem[];
  direction?: 'vertical' | 'horizontal';
  padding?: number;
  spacing?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export class List extends ComposeNode {
  constructor(public props: ListProps) {
    super();
    this.updateItems();
  }

  private updateItems() {
    // 清空现有子元素
    this.children = [];
    // 添加新的子元素
    this.props.items.forEach(item => {
      this.addChild(item.content);
    });
  }

  measure(constraints: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number }) {
    const { width, height, direction = 'vertical', spacing = 0import { ComposeNode } from '@canvas-compose/composer';

export interface ListItem {
  key: string;
  content: ComposeNode;
}

export interface ListProps {
  items: ListItem[];
  direction?: 'vertical' | 'horizontal';
  padding?: number;
  spacing?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export class List extends ComposeNode {
  constructor(public props: ListProps) {
    super();
    this.updateItems();
  }

  private updateItems() {
    // 清空现有子元素
    this.children = [];
    // 添加新的子元素
    this.props.items.forEach(item => {
      this.addChild(item.content);
    });
  }

  measure(constraints: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number }) {
    const { width, height, direction = 'vertical', spacing = 0, padding = 0 } = this.props;

    let listWidth = width || constraintsimport { ComposeNode } from '@canvas-compose/composer';

export interface ListItem {
  key: string;
  content: ComposeNode;
}

export interface ListProps {
  items: ListItem[];
  direction?: 'vertical' | 'horizontal';
  padding?: number;
  spacing?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export class List extends ComposeNode {
  constructor(public props: ListProps) {
    super();
    this.updateItems();
  }

  private updateItems() {
    // 清空现有子元素
    this.children = [];
    // 添加新的子元素
    this.props.items.forEach(item => {
      this.addChild(item.content);
    });
  }

  measure(constraints: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number }) {
    const { width, height, direction = 'vertical', spacing = 0, padding = 0 } = this.props;

    let listWidth = width || constraints.maxWidth;
    let listHeight = heightimport { ComposeNode } from '@canvas-compose/composer';

export interface ListItem {
  key: string;
  content: ComposeNode;
}

export interface ListProps {
  items: ListItem[];
  direction?: 'vertical' | 'horizontal';
  padding?: number;
  spacing?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export class List extends ComposeNode {
  constructor(public props: ListProps) {
    super();
    this.updateItems();
  }

  private updateItems() {
    // 清空现有子元素
    this.children = [];
    // 添加新的子元素
    this.props.items.forEach(item => {
      this.addChild(item.content);
    });
  }

  measure(constraints: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number }) {
    const { width, height, direction = 'vertical', spacing = 0, padding = 0 } = this.props;

    let listWidth = width || constraints.maxWidth;
    let listHeight = height || constraints.maxHeight;

    // 测量子元素
    if (this.children.lengthimport { ComposeNode } from '@canvas-compose/composer';

export interface ListItem {
  key: string;
  content: ComposeNode;
}

export interface ListProps {
  items: ListItem[];
  direction?: 'vertical' | 'horizontal';
  padding?: number;
  spacing?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export class List extends ComposeNode {
  constructor(public props: ListProps) {
    super();
    this.updateItems();
  }

  private updateItems() {
    // 清空现有子元素
    this.children = [];
    // 添加新的子元素
    this.props.items.forEach(item => {
      this.addChild(item.content);
    });
  }

  measure(constraints: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number }) {
    const { width, height, direction = 'vertical', spacing = 0, padding = 0 } = this.props;

    let listWidth = width || constraints.maxWidth;
    let listHeight = height || constraints.maxHeight;

    // 测量子元素
    if (this.children.length > 0) {
      let totalChildWidth = 0;
      let totalChildimport { ComposeNode } from '@canvas-compose/composer';

export interface ListItem {
  key: string;
  content: ComposeNode;
}

export interface ListProps {
  items: ListItem[];
  direction?: 'vertical' | 'horizontal';
  padding?: number;
  spacing?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export class List extends ComposeNode {
  constructor(public props: ListProps) {
    super();
    this.updateItems();
  }

  private updateItems() {
    // 清空现有子元素
    this.children = [];
    // 添加新的子元素
    this.props.items.forEach(item => {
      this.addChild(item.content);
    });
  }

  measure(constraints: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number }) {
    const { width, height, direction = 'vertical', spacing = 0, padding = 0 } = this.props;

    let listWidth = width || constraints.maxWidth;
    let listHeight = height || constraints.maxHeight;

    // 测量子元素
    if (this.children.length > 0) {
      let totalChildWidth = 0;
      let totalChildHeight = 0;

      this.children.forEach((child, index) => {
import { ComposeNode } from '@canvas-compose/composer';

export interface ListItem {
  key: string;
  content: ComposeNode;
}

export interface ListProps {
  items: ListItem[];
  direction?: 'vertical' | 'horizontal';
  padding?: number;
  spacing?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export class List extends ComposeNode {
  constructor(public props: ListProps) {
    super();
    this.updateItems();
  }

  private updateItems() {
    // 清空现有子元素
    this.children = [];
    // 添加新的子元素
    this.props.items.forEach(item => {
      this.addChild(item.content);
    });
  }

  measure(constraints: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number }) {
    const { width, height, direction = 'vertical', spacing = 0, padding = 0 } = this.props;

    let listWidth = width || constraints.maxWidth;
    let listHeight = height || constraints.maxHeight;

    // 测量子元素
    if (this.children.length > 0) {
      let totalChildWidth = 0;
      let totalChildHeight = 0;

      this.children.forEach((child, index) => {
        const childConstraints = {
          minWidth:import { ComposeNode } from '@canvas-compose/composer';

export interface ListItem {
  key: string;
  content: ComposeNode;
}

export interface ListProps {
  items: ListItem[];
  direction?: 'vertical' | 'horizontal';
  padding?: number;
  spacing?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export class List extends ComposeNode {
  constructor(public props: ListProps) {
    super();
    this.updateItems();
  }

  private updateItems() {
    // 清空现有子元素
    this.children = [];
    // 添加新的子元素
    this.props.items.forEach(item => {
      this.addChild(item.content);
    });
  }

  measure(constraints: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number }) {
    const { width, height, direction = 'vertical', spacing = 0, padding = 0 } = this.props;

    let listWidth = width || constraints.maxWidth;
    let listHeight = height || constraints.maxHeight;

    // 测量子元素
    if (this.children.length > 0) {
      let totalChildWidth = 0;
      let totalChildHeight = 0;

      this.children.forEach((child, index) => {
        const childConstraints = {
          minWidth: 0,
          maxWidth: direction === 'horizontal' ? (listWidth - padding *import { ComposeNode } from '@canvas-compose/composer';

export interface ListItem {
  key: string;
  content: ComposeNode;
}

export interface ListProps {
  items: ListItem[];
  direction?: 'vertical' | 'horizontal';
  padding?: number;
  spacing?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export class List extends ComposeNode {
  constructor(public props: ListProps) {
    super();
    this.updateItems();
  }

  private updateItems() {
    // 清空现有子元素
    this.children = [];
    // 添加新的子元素
    this.props.items.forEach(item => {
      this.addChild(item.content);
    });
  }

  measure(constraints: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number }) {
    const { width, height, direction = 'vertical', spacing = 0, padding = 0 } = this.props;

    let listWidth = width || constraints.maxWidth;
    let listHeight = height || constraints.maxHeight;

    // 测量子元素
    if (this.children.length > 0) {
      let totalChildWidth = 0;
      let totalChildHeight = 0;

      this.children.forEach((child, index) => {
        const childConstraints = {
          minWidth: 0,
          maxWidth: direction === 'horizontal' ? (listWidth - padding * 2) / this.children.length : listWidthimport { ComposeNode } from '@canvas-compose/composer';

export interface ListItem {
  key: string;
  content: ComposeNode;
}

export interface ListProps {
  items: ListItem[];
  direction?: 'vertical' | 'horizontal';
  padding?: number;
  spacing?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export class List extends ComposeNode {
  constructor(public props: ListProps) {
    super();
    this.updateItems();
  }

  private updateItems() {
    // 清空现有子元素
    this.children = [];
    // 添加新的子元素
    this.props.items.forEach(item => {
      this.addChild(item.content);
    });
  }

  measure(constraints: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number }) {
    const { width, height, direction = 'vertical', spacing = 0, padding = 0 } = this.props;

    let listWidth = width || constraints.maxWidth;
    let listHeight = height || constraints.maxHeight;

    // 测量子元素
    if (this.children.length > 0) {
      let totalChildWidth = 0;
      let totalChildHeight = 0;

      this.children.forEach((child, index) => {
        const childConstraints = {
          minWidth: 0,
          maxWidth: direction === 'horizontal' ? (listWidth - padding * 2) / this.children.length : listWidth - padding * 2,
          minHeight: 0,
          maxHeight: directionimport { ComposeNode } from '@canvas-compose/composer';

export interface ListItem {
  key: string;
  content: ComposeNode;
}

export interface ListProps {
  items: ListItem[];
  direction?: 'vertical' | 'horizontal';
  padding?: number;
  spacing?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export class List extends ComposeNode {
  constructor(public props: ListProps) {
    super();
    this.updateItems();
  }

  private updateItems() {
    // 清空现有子元素
    this.children = [];
    // 添加新的子元素
    this.props.items.forEach(item => {
      this.addChild(item.content);
    });
  }

  measure(constraints: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number }) {
    const { width, height, direction = 'vertical', spacing = 0, padding = 0 } = this.props;

    let listWidth = width || constraints.maxWidth;
    let listHeight = height || constraints.maxHeight;

    // 测量子元素
    if (this.children.length > 0) {
      let totalChildWidth = 0;
      let totalChildHeight = 0;

      this.children.forEach((child, index) => {
        const childConstraints = {
          minWidth: 0,
          maxWidth: direction === 'horizontal' ? (listWidth - padding * 2) / this.children.length : listWidth - padding * 2,
          minHeight: 0,
          maxHeight: direction === 'vertical' ? (listHeight - padding * 2) / this.children.length : listimport { ComposeNode } from '@canvas-compose/composer';

export interface ListItem {
  key: string;
  content: ComposeNode;
}

export interface ListProps {
  items: ListItem[];
  direction?: 'vertical' | 'horizontal';
  padding?: number;
  spacing?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export class List extends ComposeNode {
  constructor(public props: ListProps) {
    super();
    this.updateItems();
  }

  private updateItems() {
    // 清空现有子元素
    this.children = [];
    // 添加新的子元素
    this.props.items.forEach(item => {
      this.addChild(item.content);
    });
  }

  measure(constraints: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number }) {
    const { width, height, direction = 'vertical', spacing = 0, padding = 0 } = this.props;

    let listWidth = width || constraints.maxWidth;
    let listHeight = height || constraints.maxHeight;

    // 测量子元素
    if (this.children.length > 0) {
      let totalChildWidth = 0;
      let totalChildHeight = 0;

      this.children.forEach((child, index) => {
        const childConstraints = {
          minWidth: 0,
          maxWidth: direction === 'horizontal' ? (listWidth - padding * 2) / this.children.length : listWidth - padding * 2,
          minHeight: 0,
          maxHeight: direction === 'vertical' ? (listHeight - padding * 2) / this.children.length : listHeight - padding * 2,
        };
        const childSize = child.measureimport { ComposeNode } from '@canvas-compose/composer';

export interface ListItem {
  key: string;
  content: ComposeNode;
}

export interface ListProps {
  items: ListItem[];
  direction?: 'vertical' | 'horizontal';
  padding?: number;
  spacing?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export class List extends ComposeNode {
  constructor(public props: ListProps) {
    super();
    this.updateItems();
  }

  private updateItems() {
    // 清空现有子元素
    this.children = [];
    // 添加新的子元素
    this.props.items.forEach(item => {
      this.addChild(item.content);
    });
  }

  measure(constraints: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number }) {
    const { width, height, direction = 'vertical', spacing = 0, padding = 0 } = this.props;

    let listWidth = width || constraints.maxWidth;
    let listHeight = height || constraints.maxHeight;

    // 测量子元素
    if (this.children.length > 0) {
      let totalChildWidth = 0;
      let totalChildHeight = 0;

      this.children.forEach((child, index) => {
        const childConstraints = {
          minWidth: 0,
          maxWidth: direction === 'horizontal' ? (listWidth - padding * 2) / this.children.length : listWidth - padding * 2,
          minHeight: 0,
          maxHeight: direction === 'vertical' ? (listHeight - padding * 2) / this.children.length : listHeight - padding * 2,
        };
        const childSize = child.measure(childConstraints);
        
        if (direction === 'horizontal') {
          totalimport { ComposeNode } from '@canvas-compose/composer';

export interface ListItem {
  key: string;
  content: ComposeNode;
}

export interface ListProps {
  items: ListItem[];
  direction?: 'vertical' | 'horizontal';
  padding?: number;
  spacing?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export class List extends ComposeNode {
  constructor(public props: ListProps) {
    super();
    this.updateItems();
  }

  private updateItems() {
    // 清空现有子元素
    this.children = [];
    // 添加新的子元素
    this.props.items.forEach(item => {
      this.addChild(item.content);
    });
  }

  measure(constraints: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number }) {
    const { width, height, direction = 'vertical', spacing = 0, padding = 0 } = this.props;

    let listWidth = width || constraints.maxWidth;
    let listHeight = height || constraints.maxHeight;

    // 测量子元素
    if (this.children.length > 0) {
      let totalChildWidth = 0;
      let totalChildHeight = 0;

      this.children.forEach((child, index) => {
        const childConstraints = {
          minWidth: 0,
          maxWidth: direction === 'horizontal' ? (listWidth - padding * 2) / this.children.length : listWidth - padding * 2,
          minHeight: 0,
          maxHeight: direction === 'vertical' ? (listHeight - padding * 2) / this.children.length : listHeight - padding * 2,
        };
        const childSize = child.measure(childConstraints);
        
        if (direction === 'horizontal') {
          totalChildWidth += childSize.width + (index > 0 ? spacing : 0);
import { ComposeNode } from '@canvas-compose/composer';

export interface ListItem {
  key: string;
  content: ComposeNode;
}

export interface ListProps {
  items: ListItem[];
  direction?: 'vertical' | 'horizontal';
  padding?: number;
  spacing?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export class List extends ComposeNode {
  constructor(public props: ListProps) {
    super();
    this.updateItems();
  }

  private updateItems() {
    // 清空现有子元素
    this.children = [];
    // 添加新的子元素
    this.props.items.forEach(item => {
      this.addChild(item.content);
    });
  }

  measure(constraints: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number }) {
    const { width, height, direction = 'vertical', spacing = 0, padding = 0 } = this.props;

    let listWidth = width || constraints.maxWidth;
    let listHeight = height || constraints.maxHeight;

    // 测量子元素
    if (this.children.length > 0) {
      let totalChildWidth = 0;
      let totalChildHeight = 0;

      this.children.forEach((child, index) => {
        const childConstraints = {
          minWidth: 0,
          maxWidth: direction === 'horizontal' ? (listWidth - padding * 2) / this.children.length : listWidth - padding * 2,
          minHeight: 0,
          maxHeight: direction === 'vertical' ? (listHeight - padding * 2) / this.children.length : listHeight - padding * 2,
        };
        const childSize = child.measure(childConstraints);
        
        if (direction === 'horizontal') {
          totalChildWidth += childSize.width + (index > 0 ? spacing : 0);
          totalChildHeight = Math.max(totalChildHeight, childSize.height);
        } elseimport { ComposeNode } from '@canvas-compose/composer';

export interface ListItem {
  key: string;
  content: ComposeNode;
}

export interface ListProps {
  items: ListItem[];
  direction?: 'vertical' | 'horizontal';
  padding?: number;
  spacing?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export class List extends ComposeNode {
  constructor(public props: ListProps) {
    super();
    this.updateItems();
  }

  private updateItems() {
    // 清空现有子元素
    this.children = [];
    // 添加新的子元素
    this.props.items.forEach(item => {
      this.addChild(item.content);
    });
  }

  measure(constraints: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number }) {
    const { width, height, direction = 'vertical', spacing = 0, padding = 0 } = this.props;

    let listWidth = width || constraints.maxWidth;
    let listHeight = height || constraints.maxHeight;

    // 测量子元素
    if (this.children.length > 0) {
      let totalChildWidth = 0;
      let totalChildHeight = 0;

      this.children.forEach((child, index) => {
        const childConstraints = {
          minWidth: 0,
          maxWidth: direction === 'horizontal' ? (listWidth - padding * 2) / this.children.length : listWidth - padding * 2,
          minHeight: 0,
          maxHeight: direction === 'vertical' ? (listHeight - padding * 2) / this.children.length : listHeight - padding * 2,
        };
        const childSize = child.measure(childConstraints);
        
        if (direction === 'horizontal') {
          totalChildWidth += childSize.width + (index > 0 ? spacing : 0);
          totalChildHeight = Math.max(totalChildHeight, childSize.height);
        } else {
          totalChildWidth = Math.max(totalChildWidth, childSize.width);
import { ComposeNode } from '@canvas-compose/composer';

export interface ListItem {
  key: string;
  content: ComposeNode;
}

export interface ListProps {
  items: ListItem[];
  direction?: 'vertical' | 'horizontal';
  padding?: number;
  spacing?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export class List extends ComposeNode {
  constructor(public props: ListProps) {
    super();
    this.updateItems();
  }

  private updateItems() {
    // 清空现有子元素
    this.children = [];
    // 添加新的子元素
    this.props.items.forEach(item => {
      this.addChild(item.content);
    });
  }

  measure(constraints: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number }) {
    const { width, height, direction = 'vertical', spacing = 0, padding = 0 } = this.props;

    let listWidth = width || constraints.maxWidth;
    let listHeight = height || constraints.maxHeight;

    // 测量子元素
    if (this.children.length > 0) {
      let totalChildWidth = 0;
      let totalChildHeight = 0;

      this.children.forEach((child, index) => {
        const childConstraints = {
          minWidth: 0,
          maxWidth: direction === 'horizontal' ? (listWidth - padding * 2) / this.children.length : listWidth - padding * 2,
          minHeight: 0,
          maxHeight: direction === 'vertical' ? (listHeight - padding * 2) / this.children.length : listHeight - padding * 2,
        };
        const childSize = child.measure(childConstraints);
        
        if (direction === 'horizontal') {
          totalChildWidth += childSize.width + (index > 0 ? spacing : 0);
          totalChildHeight = Math.max(totalChildHeight, childSize.height);
        } else {
          totalChildWidth = Math.max(totalChildWidth, childSize.width);
          totalChildHeight += childSize.height + (index > 0 ? spacing : 0);
        }
      });

import { ComposeNode } from '@canvas-compose/composer';

export interface ListItem {
  key: string;
  content: ComposeNode;
}

export interface ListProps {
  items: ListItem[];
  direction?: 'vertical' | 'horizontal';
  padding?: number;
  spacing?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export class List extends ComposeNode {
  constructor(public props: ListProps) {
    super();
    this.updateItems();
  }

  private updateItems() {
    // 清空现有子元素
    this.children = [];
    // 添加新的子元素
    this.props.items.forEach(item => {
      this.addChild(item.content);
    });
  }

  measure(constraints: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number }) {
    const { width, height, direction = 'vertical', spacing = 0, padding = 0 } = this.props;

    let listWidth = width || constraints.maxWidth;
    let listHeight = height || constraints.maxHeight;

    // 测量子元素
    if (this.children.length > 0) {
      let totalChildWidth = 0;
      let totalChildHeight = 0;

      this.children.forEach((child, index) => {
        const childConstraints = {
          minWidth: 0,
          maxWidth: direction === 'horizontal' ? (listWidth - padding * 2) / this.children.length : listWidth - padding * 2,
          minHeight: 0,
          maxHeight: direction === 'vertical' ? (listHeight - padding * 2) / this.children.length : listHeight - padding * 2,
        };
        const childSize = child.measure(childConstraints);
        
        if (direction === 'horizontal') {
          totalChildWidth += childSize.width + (index > 0 ? spacing : 0);
          totalChildHeight = Math.max(totalChildHeight, childSize.height);
        } else {
          totalChildWidth = Math.max(totalChildWidth, childSize.width);
          totalChildHeight += childSize.height + (index > 0 ? spacing : 0);
        }
      });

      if (!width) {
        listWidth =import { ComposeNode } from '@canvas-compose/composer';

export interface ListItem {
  key: string;
  content: ComposeNode;
}

export interface ListProps {
  items: ListItem[];
  direction?: 'vertical' | 'horizontal';
  padding?: number;
  spacing?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export class List extends ComposeNode {
  constructor(public props: ListProps) {
    super();
    this.updateItems();
  }

  private updateItems() {
    // 清空现有子元素
    this.children = [];
    // 添加新的子元素
    this.props.items.forEach(item => {
      this.addChild(item.content);
    });
  }

  measure(constraints: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number }) {
    const { width, height, direction = 'vertical', spacing = 0, padding = 0 } = this.props;

    let listWidth = width || constraints.maxWidth;
    let listHeight = height || constraints.maxHeight;

    // 测量子元素
    if (this.children.length > 0) {
      let totalChildWidth = 0;
      let totalChildHeight = 0;

      this.children.forEach((child, index) => {
        const childConstraints = {
          minWidth: 0,
          maxWidth: direction === 'horizontal' ? (listWidth - padding * 2) / this.children.length : listWidth - padding * 2,
          minHeight: 0,
          maxHeight: direction === 'vertical' ? (listHeight - padding * 2) / this.children.length : listHeight - padding * 2,
        };
        const childSize = child.measure(childConstraints);
        
        if (direction === 'horizontal') {
          totalChildWidth += childSize.width + (index > 0 ? spacing : 0);
          totalChildHeight = Math.max(totalChildHeight, childSize.height);
        } else {
          totalChildWidth = Math.max(totalChildWidth, childSize.width);
          totalChildHeight += childSize.height + (index > 0 ? spacing : 0);
        }
      });

      if (!width) {
        listWidth = totalChildWidth + padding * 2;
      }
      if (!height) {
import { ComposeNode } from '@canvas-compose/composer';

export interface ListItem {
  key: string;
  content: ComposeNode;
}

export interface ListProps {
  items: ListItem[];
  direction?: 'vertical' | 'horizontal';
  padding?: number;
  spacing?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export class List extends ComposeNode {
  constructor(public props: ListProps) {
    super();
    this.updateItems();
  }

  private updateItems() {
    // 清空现有子元素
    this.children = [];
    // 添加新的子元素
    this.props.items.forEach(item => {
      this.addChild(item.content);
    });
  }

  measure(constraints: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number }) {
    const { width, height, direction = 'vertical', spacing = 0, padding = 0 } = this.props;

    let listWidth = width || constraints.maxWidth;
    let listHeight = height || constraints.maxHeight;

    // 测量子元素
    if (this.children.length > 0) {
      let totalChildWidth = 0;
      let totalChildHeight = 0;

      this.children.forEach((child, index) => {
        const childConstraints = {
          minWidth: 0,
          maxWidth: direction === 'horizontal' ? (listWidth - padding * 2) / this.children.length : listWidth - padding * 2,
          minHeight: 0,
          maxHeight: direction === 'vertical' ? (listHeight - padding * 2) / this.children.length : listHeight - padding * 2,
        };
        const childSize = child.measure(childConstraints);
        
        if (direction === 'horizontal') {
          totalChildWidth += childSize.width + (index > 0 ? spacing : 0);
          totalChildHeight = Math.max(totalChildHeight, childSize.height);
        } else {
          totalChildWidth = Math.max(totalChildWidth, childSize.width);
          totalChildHeight += childSize.height + (index > 0 ? spacing : 0);
        }
      });

      if (!width) {
        listWidth = totalChildWidth + padding * 2;
      }
      if (!height) {
        listHeight = totalChildHeight + padding * 2;
      }
    }
import { ComposeNode } from '@canvas-compose/composer';

export interface ListItem {
  key: string;
  content: ComposeNode;
}

export interface ListProps {
  items: ListItem[];
  direction?: 'vertical' | 'horizontal';
  padding?: number;
  spacing?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export class List extends ComposeNode {
  constructor(public props: ListProps) {
    super();
    this.updateItems();
  }

  private updateItems() {
    // 清空现有子元素
    this.children = [];
    // 添加新的子元素
    this.props.items.forEach(item => {
      this.addChild(item.content);
    });
  }

  measure(constraints: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number }) {
    const { width, height, direction = 'vertical', spacing = 0, padding = 0 } = this.props;

    let listWidth = width || constraints.maxWidth;
    let listHeight = height || constraints.maxHeight;

    // 测量子元素
    if (this.children.length > 0) {
      let totalChildWidth = 0;
      let totalChildHeight = 0;

      this.children.forEach((child, index) => {
        const childConstraints = {
          minWidth: 0,
          maxWidth: direction === 'horizontal' ? (listWidth - padding * 2) / this.children.length : listWidth - padding * 2,
          minHeight: 0,
          maxHeight: direction === 'vertical' ? (listHeight - padding * 2) / this.children.length : listHeight - padding * 2,
        };
        const childSize = child.measure(childConstraints);
        
        if (direction === 'horizontal') {
          totalChildWidth += childSize.width + (index > 0 ? spacing : 0);
          totalChildHeight = Math.max(totalChildHeight, childSize.height);
        } else {
          totalChildWidth = Math.max(totalChildWidth, childSize.width);
          totalChildHeight += childSize.height + (index > 0 ? spacing : 0);
        }
      });

      if (!width) {
        listWidth = totalChildWidth + padding * 2;
      }
      if (!height) {
        listHeight = totalChildHeight + padding * 2;
      }
    }

    return { 
      width: Math.min(listWidth, constraints.maxWidth), 
import { ComposeNode } from '@canvas-compose/composer';

export interface ListItem {
  key: string;
  content: ComposeNode;
}

export interface ListProps {
  items: ListItem[];
  direction?: 'vertical' | 'horizontal';
  padding?: number;
  spacing?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export class List extends ComposeNode {
  constructor(public props: ListProps) {
    super();
    this.updateItems();
  }

  private updateItems() {
    // 清空现有子元素
    this.children = [];
    // 添加新的子元素
    this.props.items.forEach(item => {
      this.addChild(item.content);
    });
  }

  measure(constraints: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number }) {
    const { width, height, direction = 'vertical', spacing = 0, padding = 0 } = this.props;

    let listWidth = width || constraints.maxWidth;
    let listHeight = height || constraints.maxHeight;

    // 测量子元素
    if (this.children.length > 0) {
      let totalChildWidth = 0;
      let totalChildHeight = 0;

      this.children.forEach((child, index) => {
        const childConstraints = {
          minWidth: 0,
          maxWidth: direction === 'horizontal' ? (listWidth - padding * 2) / this.children.length : listWidth - padding * 2,
          minHeight: 0,
          maxHeight: direction === 'vertical' ? (listHeight - padding * 2) / this.children.length : listHeight - padding * 2,
        };
        const childSize = child.measure(childConstraints);
        
        if (direction === 'horizontal') {
          totalChildWidth += childSize.width + (index > 0 ? spacing : 0);
          totalChildHeight = Math.max(totalChildHeight, childSize.height);
        } else {
          totalChildWidth = Math.max(totalChildWidth, childSize.width);
          totalChildHeight += childSize.height + (index > 0 ? spacing : 0);
        }
      });

      if (!width) {
        listWidth = totalChildWidth + padding * 2;
      }
      if (!height) {
        listHeight = totalChildHeight + padding * 2;
      }
    }

    return { 
      width: Math.min(listWidth, constraints.maxWidth), 
      height: Math.min(listHeight, constraints.maxHeight) 
    };
  }

  place(x: number, y:import { ComposeNode } from '@canvas-compose/composer';

export interface ListItem {
  key: string;
  content: ComposeNode;
}

export interface ListProps {
  items: ListItem[];
  direction?: 'vertical' | 'horizontal';
  padding?: number;
  spacing?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export class List extends ComposeNode {
  constructor(public props: ListProps) {
    super();
    this.updateItems();
  }

  private updateItems() {
    // 清空现有子元素
    this.children = [];
    // 添加新的子元素
    this.props.items.forEach(item => {
      this.addChild(item.content);
    });
  }

  measure(constraints: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number }) {
    const { width, height, direction = 'vertical', spacing = 0, padding = 0 } = this.props;

    let listWidth = width || constraints.maxWidth;
    let listHeight = height || constraints.maxHeight;

    // 测量子元素
    if (this.children.length > 0) {
      let totalChildWidth = 0;
      let totalChildHeight = 0;

      this.children.forEach((child, index) => {
        const childConstraints = {
          minWidth: 0,
          maxWidth: direction === 'horizontal' ? (listWidth - padding * 2) / this.children.length : listWidth - padding * 2,
          minHeight: 0,
          maxHeight: direction === 'vertical' ? (listHeight - padding * 2) / this.children.length : listHeight - padding * 2,
        };
        const childSize = child.measure(childConstraints);
        
        if (direction === 'horizontal') {
          totalChildWidth += childSize.width + (index > 0 ? spacing : 0);
          totalChildHeight = Math.max(totalChildHeight, childSize.height);
        } else {
          totalChildWidth = Math.max(totalChildWidth, childSize.width);
          totalChildHeight += childSize.height + (index > 0 ? spacing : 0);
        }
      });

      if (!width) {
        listWidth = totalChildWidth + padding * 2;
      }
      if (!height) {
        listHeight = totalChildHeight + padding * 2;
      }
    }

    return { 
      width: Math.min(listWidth, constraints.maxWidth), 
      height: Math.min(listHeight, constraints.maxHeight) 
    };
  }

  place(x: number, y: number, width: number, height: number)import { ComposeNode } from '@canvas-compose/composer';

export interface ListItem {
  key: string;
  content: ComposeNode;
}

export interface ListProps {
  items: ListItem[];
  direction?: 'vertical' | 'horizontal';
  padding?: number;
  spacing?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export class List extends ComposeNode {
  constructor(public props: ListProps) {
    super();
    this.updateItems();
  }

  private updateItems() {
    // 清空现有子元素
    this.children = [];
    // 添加新的子元素
    this.props.items.forEach(item => {
      this.addChild(item.content);
    });
  }

  measure(constraints: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number }) {
    const { width, height, direction = 'vertical', spacing = 0, padding = 0 } = this.props;

    let listWidth = width || constraints.maxWidth;
    let listHeight = height || constraints.maxHeight;

    // 测量子元素
    if (this.children.length > 0) {
      let totalChildWidth = 0;
      let totalChildHeight = 0;

      this.children.forEach((child, index) => {
        const childConstraints = {
          minWidth: 0,
          maxWidth: direction === 'horizontal' ? (listWidth - padding * 2) / this.children.length : listWidth - padding * 2,
          minHeight: 0,
          maxHeight: direction === 'vertical' ? (listHeight - padding * 2) / this.children.length : listHeight - padding * 2,
        };
        const childSize = child.measure(childConstraints);
        
        if (direction === 'horizontal') {
          totalChildWidth += childSize.width + (index > 0 ? spacing : 0);
          totalChildHeight = Math.max(totalChildHeight, childSize.height);
        } else {
          totalChildWidth = Math.max(totalChildWidth, childSize.width);
          totalChildHeight += childSize.height + (index > 0 ? spacing : 0);
        }
      });

      if (!width) {
        listWidth = totalChildWidth + padding * 2;
      }
      if (!height) {
        listHeight = totalChildHeight + padding * 2;
      }
    }

    return { 
      width: Math.min(listWidth, constraints.maxWidth), 
      height: Math.min(listHeight, constraints.maxHeight) 
    };
  }

  place(x: number, y: number, width: number, height: number) {
    const { x: offsetX = 0, y: offsetY = 0import { ComposeNode } from '@canvas-compose/composer';

export interface ListItem {
  key: string;
  content: ComposeNode;
}

export interface ListProps {
  items: ListItem[];
  direction?: 'vertical' | 'horizontal';
  padding?: number;
  spacing?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export class List extends ComposeNode {
  constructor(public props: ListProps) {
    super();
    this.updateItems();
  }

  private updateItems() {
    // 清空现有子元素
    this.children = [];
    // 添加新的子元素
    this.props.items.forEach(item => {
      this.addChild(item.content);
    });
  }

  measure(constraints: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number }) {
    const { width, height, direction = 'vertical', spacing = 0, padding = 0 } = this.props;

    let listWidth = width || constraints.maxWidth;
    let listHeight = height || constraints.maxHeight;

    // 测量子元素
    if (this.children.length > 0) {
      let totalChildWidth = 0;
      let totalChildHeight = 0;

      this.children.forEach((child, index) => {
        const childConstraints = {
          minWidth: 0,
          maxWidth: direction === 'horizontal' ? (listWidth - padding * 2) / this.children.length : listWidth - padding * 2,
          minHeight: 0,
          maxHeight: direction === 'vertical' ? (listHeight - padding * 2) / this.children.length : listHeight - padding * 2,
        };
        const childSize = child.measure(childConstraints);
        
        if (direction === 'horizontal') {
          totalChildWidth += childSize.width + (index > 0 ? spacing : 0);
          totalChildHeight = Math.max(totalChildHeight, childSize.height);
        } else {
          totalChildWidth = Math.max(totalChildWidth, childSize.width);
          totalChildHeight += childSize.height + (index > 0 ? spacing : 0);
        }
      });

      if (!width) {
        listWidth = totalChildWidth + padding * 2;
      }
      if (!height) {
        listHeight = totalChildHeight + padding * 2;
      }
    }

    return { 
      width: Math.min(listWidth, constraints.maxWidth), 
      height: Math.min(listHeight, constraints.maxHeight) 
    };
  }

  place(x: number, y: number, width: number, height: number) {
    const { x: offsetX = 0, y: offsetY = 0, direction = 'vertical', spacing = 0, padding = 0 } = this.props;
    super.place(x + offsetX, yimport { ComposeNode } from '@canvas-compose/composer';

export interface ListItem {
  key: string;
  content: ComposeNode;
}

export interface ListProps {
  items: ListItem[];
  direction?: 'vertical' | 'horizontal';
  padding?: number;
  spacing?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export class List extends ComposeNode {
  constructor(public props: ListProps) {
    super();
    this.updateItems();
  }

  private updateItems() {
    // 清空现有子元素
    this.children = [];
    // 添加新的子元素
    this.props.items.forEach(item => {
      this.addChild(item.content);
    });
  }

  measure(constraints: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number }) {
    const { width, height, direction = 'vertical', spacing = 0, padding = 0 } = this.props;

    let listWidth = width || constraints.maxWidth;
    let listHeight = height || constraints.maxHeight;

    // 测量子元素
    if (this.children.length > 0) {
      let totalChildWidth = 0;
      let totalChildHeight = 0;

      this.children.forEach((child, index) => {
        const childConstraints = {
          minWidth: 0,
          maxWidth: direction === 'horizontal' ? (listWidth - padding * 2) / this.children.length : listWidth - padding * 2,
          minHeight: 0,
          maxHeight: direction === 'vertical' ? (listHeight - padding * 2) / this.children.length : listHeight - padding * 2,
        };
        const childSize = child.measure(childConstraints);
        
        if (direction === 'horizontal') {
          totalChildWidth += childSize.width + (index > 0 ? spacing : 0);
          totalChildHeight = Math.max(totalChildHeight, childSize.height);
        } else {
          totalChildWidth = Math.max(totalChildWidth, childSize.width);
          totalChildHeight += childSize.height + (index > 0 ? spacing : 0);
        }
      });

      if (!width) {
        listWidth = totalChildWidth + padding * 2;
      }
      if (!height) {
        listHeight = totalChildHeight + padding * 2;
      }
    }

    return { 
      width: Math.min(listWidth, constraints.maxWidth), 
      height: Math.min(listHeight, constraints.maxHeight) 
    };
  }

  place(x: number, y: number, width: number, height: number) {
    const { x: offsetX = 0, y: offsetY = 0, direction = 'vertical', spacing = 0, padding = 0 } = this.props;
    super.place(x + offsetX, y + offsetY, width, height);
import { ComposeNode } from '@canvas-compose/composer';

export interface ListItem {
  key: string;
  content: ComposeNode;
}

export interface ListProps {
  items: ListItem[];
  direction?: 'vertical' | 'horizontal';
  padding?: number;
  spacing?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export class List extends ComposeNode {
  constructor(public props: ListProps) {
    super();
    this.updateItems();
  }

  private updateItems() {
    // 清空现有子元素
    this.children = [];
    // 添加新的子元素
    this.props.items.forEach(item => {
      this.addChild(item.content);
    });
  }

  measure(constraints: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number }) {
    const { width, height, direction = 'vertical', spacing = 0, padding = 0 } = this.props;

    let listWidth = width || constraints.maxWidth;
    let listHeight = height || constraints.maxHeight;

    // 测量子元素
    if (this.children.length > 0) {
      let totalChildWidth = 0;
      let totalChildHeight = 0;

      this.children.forEach((child, index) => {
        const childConstraints = {
          minWidth: 0,
          maxWidth: direction === 'horizontal' ? (listWidth - padding * 2) / this.children.length : listWidth - padding * 2,
          minHeight: 0,
          maxHeight: direction === 'vertical' ? (listHeight - padding * 2) / this.children.length : listHeight - padding * 2,
        };
        const childSize = child.measure(childConstraints);
        
        if (direction === 'horizontal') {
          totalChildWidth += childSize.width + (index > 0 ? spacing : 0);
          totalChildHeight = Math.max(totalChildHeight, childSize.height);
        } else {
          totalChildWidth = Math.max(totalChildWidth, childSize.width);
          totalChildHeight += childSize.height + (index > 0 ? spacing : 0);
        }
      });

      if (!width) {
        listWidth = totalChildWidth + padding * 2;
      }
      if (!height) {
        listHeight = totalChildHeight + padding * 2;
      }
    }

    return { 
      width: Math.min(listWidth, constraints.maxWidth), 
      height: Math.min(listHeight, constraints.maxHeight) 
    };
  }

  place(x: number, y: number, width: number, height: number) {
    const { x: offsetX = 0, y: offsetY = 0, direction = 'vertical', spacing = 0, padding = 0 } = this.props;
    super.place(x + offsetX, y + offsetY, width, height);

    // 放置子元素
    let currentX = padding;
    let currentYimport { ComposeNode } from '@canvas-compose/composer';

export interface ListItem {
  key: string;
  content: ComposeNode;
}

export interface ListProps {
  items: ListItem[];
  direction?: 'vertical' | 'horizontal';
  padding?: number;
  spacing?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export class List extends ComposeNode {
  constructor(public props: ListProps) {
    super();
    this.updateItems();
  }

  private updateItems() {
    // 清空现有子元素
    this.children = [];
    // 添加新的子元素
    this.props.items.forEach(item => {
      this.addChild(item.content);
    });
  }

  measure(constraints: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number }) {
    const { width, height, direction = 'vertical', spacing = 0, padding = 0 } = this.props;

    let listWidth = width || constraints.maxWidth;
    let listHeight = height || constraints.maxHeight;

    // 测量子元素
    if (this.children.length > 0) {
      let totalChildWidth = 0;
      let totalChildHeight = 0;

      this.children.forEach((child, index) => {
        const childConstraints = {
          minWidth: 0,
          maxWidth: direction === 'horizontal' ? (listWidth - padding * 2) / this.children.length : listWidth - padding * 2,
          minHeight: 0,
          maxHeight: direction === 'vertical' ? (listHeight - padding * 2) / this.children.length : listHeight - padding * 2,
        };
        const childSize = child.measure(childConstraints);
        
        if (direction === 'horizontal') {
          totalChildWidth += childSize.width + (index > 0 ? spacing : 0);
          totalChildHeight = Math.max(totalChildHeight, childSize.height);
        } else {
          totalChildWidth = Math.max(totalChildWidth, childSize.width);
          totalChildHeight += childSize.height + (index > 0 ? spacing : 0);
        }
      });

      if (!width) {
        listWidth = totalChildWidth + padding * 2;
      }
      if (!height) {
        listHeight = totalChildHeight + padding * 2;
      }
    }

    return { 
      width: Math.min(listWidth, constraints.maxWidth), 
      height: Math.min(listHeight, constraints.maxHeight) 
    };
  }

  place(x: number, y: number, width: number, height: number) {
    const { x: offsetX = 0, y: offsetY = 0, direction = 'vertical', spacing = 0, padding = 0 } = this.props;
    super.place(x + offsetX, y + offsetY, width, height);

    // 放置子元素
    let currentX = padding;
    let currentY = padding;

    this.children.forEach(child => {
      const childConstraints = {
import { ComposeNode } from '@canvas-compose/composer';

export interface ListItem {
  key: string;
  content: ComposeNode;
}

export interface ListProps {
  items: ListItem[];
  direction?: 'vertical' | 'horizontal';
  padding?: number;
  spacing?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export class List extends ComposeNode {
  constructor(public props: ListProps) {
    super();
    this.updateItems();
  }

  private updateItems() {
    // 清空现有子元素
    this.children = [];
    // 添加新的子元素
    this.props.items.forEach(item => {
      this.addChild(item.content);
    });
  }

  measure(constraints: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number }) {
    const { width, height, direction = 'vertical', spacing = 0, padding = 0 } = this.props;

    let listWidth = width || constraints.maxWidth;
    let listHeight = height || constraints.maxHeight;

    // 测量子元素
    if (this.children.length > 0) {
      let totalChildWidth = 0;
      let totalChildHeight = 0;

      this.children.forEach((child, index) => {
        const childConstraints = {
          minWidth: 0,
          maxWidth: direction === 'horizontal' ? (listWidth - padding * 2) / this.children.length : listWidth - padding * 2,
          minHeight: 0,
          maxHeight: direction === 'vertical' ? (listHeight - padding * 2) / this.children.length : listHeight - padding * 2,
        };
        const childSize = child.measure(childConstraints);
        
        if (direction === 'horizontal') {
          totalChildWidth += childSize.width + (index > 0 ? spacing : 0);
          totalChildHeight = Math.max(totalChildHeight, childSize.height);
        } else {
          totalChildWidth = Math.max(totalChildWidth, childSize.width);
          totalChildHeight += childSize.height + (index > 0 ? spacing : 0);
        }
      });

      if (!width) {
        listWidth = totalChildWidth + padding * 2;
      }
      if (!height) {
        listHeight = totalChildHeight + padding * 2;
      }
    }

    return { 
      width: Math.min(listWidth, constraints.maxWidth), 
      height: Math.min(listHeight, constraints.maxHeight) 
    };
  }

  place(x: number, y: number, width: number, height: number) {
    const { x: offsetX = 0, y: offsetY = 0, direction = 'vertical', spacing = 0, padding = 0 } = this.props;
    super.place(x + offsetX, y + offsetY, width, height);

    // 放置子元素
    let currentX = padding;
    let currentY = padding;

    this.children.forEach(child => {
      const childConstraints = {
        minWidth: 0,
        maximport { ComposeNode } from '@canvas-compose/composer';

export interface ListItem {
  key: string;
  content: ComposeNode;
}

export interface ListProps {
  items: ListItem[];
  direction?: 'vertical' | 'horizontal';
  padding?: number;
  spacing?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export class List extends ComposeNode {
  constructor(public props: ListProps) {
    super();
    this.updateItems();
  }

  private updateItems() {
    // 清空现有子元素
    this.children = [];
    // 添加新的子元素
    this.props.items.forEach(item => {
      this.addChild(item.content);
    });
  }

  measure(constraints: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number }) {
    const { width, height, direction = 'vertical', spacing = 0, padding = 0 } = this.props;

    let listWidth = width || constraints.maxWidth;
    let listHeight = height || constraints.maxHeight;

    // 测量子元素
    if (this.children.length > 0) {
      let totalChildWidth = 0;
      let totalChildHeight = 0;

      this.children.forEach((child, index) => {
        const childConstraints = {
          minWidth: 0,
          maxWidth: direction === 'horizontal' ? (listWidth - padding * 2) / this.children.length : listWidth - padding * 2,
          minHeight: 0,
          maxHeight: direction === 'vertical' ? (listHeight - padding * 2) / this.children.length : listHeight - padding * 2,
        };
        const childSize = child.measure(childConstraints);
        
        if (direction === 'horizontal') {
          totalChildWidth += childSize.width + (index > 0 ? spacing : 0);
          totalChildHeight = Math.max(totalChildHeight, childSize.height);
        } else {
          totalChildWidth = Math.max(totalChildWidth, childSize.width);
          totalChildHeight += childSize.height + (index > 0 ? spacing : 0);
        }
      });

      if (!width) {
        listWidth = totalChildWidth + padding * 2;
      }
      if (!height) {
        listHeight = totalChildHeight + padding * 2;
      }
    }

    return { 
      width: Math.min(listWidth, constraints.maxWidth), 
      height: Math.min(listHeight, constraints.maxHeight) 
    };
  }

  place(x: number, y: number, width: number, height: number) {
    const { x: offsetX = 0, y: offsetY = 0, direction = 'vertical', spacing = 0, padding = 0 } = this.props;
    super.place(x + offsetX, y + offsetY, width, height);

    // 放置子元素
    let currentX = padding;
    let currentY = padding;

    this.children.forEach(child => {
      const childConstraints = {
        minWidth: 0,
        maxWidth: direction === 'horizontal' ? (widthimport { ComposeNode } from '@canvas-compose/composer';

export interface ListItem {
  key: string;
  content: ComposeNode;
}

export interface ListProps {
  items: ListItem[];
  direction?: 'vertical' | 'horizontal';
  padding?: number;
  spacing?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export class List extends ComposeNode {
  constructor(public props: ListProps) {
    super();
    this.updateItems();
  }

  private updateItems() {
    // 清空现有子元素
    this.children = [];
    // 添加新的子元素
    this.props.items.forEach(item => {
      this.addChild(item.content);
    });
  }

  measure(constraints: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number }) {
    const { width, height, direction = 'vertical', spacing = 0, padding = 0 } = this.props;

    let listWidth = width || constraints.maxWidth;
    let listHeight = height || constraints.maxHeight;

    // 测量子元素
    if (this.children.length > 0) {
      let totalChildWidth = 0;
      let totalChildHeight = 0;

      this.children.forEach((child, index) => {
        const childConstraints = {
          minWidth: 0,
          maxWidth: direction === 'horizontal' ? (listWidth - padding * 2) / this.children.length : listWidth - padding * 2,
          minHeight: 0,
          maxHeight: direction === 'vertical' ? (listHeight - padding * 2) / this.children.length : listHeight - padding * 2,
        };
        const childSize = child.measure(childConstraints);
        
        if (direction === 'horizontal') {
          totalChildWidth += childSize.width + (index > 0 ? spacing : 0);
          totalChildHeight = Math.max(totalChildHeight, childSize.height);
        } else {
          totalChildWidth = Math.max(totalChildWidth, childSize.width);
          totalChildHeight += childSize.height + (index > 0 ? spacing : 0);
        }
      });

      if (!width) {
        listWidth = totalChildWidth + padding * 2;
      }
      if (!height) {
        listHeight = totalChildHeight + padding * 2;
      }
    }

    return { 
      width: Math.min(listWidth, constraints.maxWidth), 
      height: Math.min(listHeight, constraints.maxHeight) 
    };
  }

  place(x: number, y: number, width: number, height: number) {
    const { x: offsetX = 0, y: offsetY = 0, direction = 'vertical', spacing = 0, padding = 0 } = this.props;
    super.place(x + offsetX, y + offsetY, width, height);

    // 放置子元素
    let currentX = padding;
    let currentY = padding;

    this.children.forEach(child => {
      const childConstraints = {
        minWidth: 0,
        maxWidth: direction === 'horizontal' ? (width - padding * 2) / this.children.length : width - padding * 2,
