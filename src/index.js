/**
 * SVG Smart Colorizer - 智能SVG随机颜色处理库
 * 
 * @author xiaolongmr
 * @version 1.0.0
 * @license MIT
 */

/**
 * SVG智能颜色处理器类
 */
class SVGSmartColorizer {
  /**
   * 构造函数
   * @param {Object} options - 配置选项
   * @param {Array} options.colorPalette - 自定义颜色调色板
   * @param {Boolean} options.preserveLinearStyle - 是否保护线性图标风格
   * @param {Boolean} options.independentColors - 填充和描边是否使用独立颜色
   * @param {Number} options.gradientProbability - 渐变色生成概率 (0-1)
   * @param {Boolean} options.debug - 是否开启调试模式
   */
  constructor(options = {}) {
    // 默认配置
    this.config = {
      colorPalette: [
        '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57',
        '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43',
        '#10ac84', '#ee5253', '#0abde3', '#3742fa', '#2f3542',
        '#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399'
      ],
      preserveLinearStyle: true,
      independentColors: true,
      gradientProbability: 0.3,
      debug: false,
      ...options
    };

    // 内部状态
    this.svgStates = new Map(); // 存储SVG的原始状态
    this.eventListeners = new Map(); // 事件监听器
    this.elementFilter = null; // 自定义元素过滤器
    this.colorValidator = null; // 自定义颜色验证器

    // 绑定方法上下文
    this.log = this.log.bind(this);
    this.emit = this.emit.bind(this);
  }

  /**
   * 日志输出
   * @param {String} level - 日志级别
   * @param {String} message - 日志消息
   * @param {...any} args - 额外参数
   */
  log(level, message, ...args) {
    if (this.config.debug) {
      console[level](`[SVGSmartColorizer] ${message}`, ...args);
    }
  }

  /**
   * 触发事件
   * @param {String} eventName - 事件名称
   * @param {Object} eventData - 事件数据
   */
  emit(eventName, eventData) {
    const listeners = this.eventListeners.get(eventName) || [];
    listeners.forEach(listener => {
      try {
        listener(eventData);
      } catch (error) {
        this.log('error', `事件监听器执行出错: ${eventName}`, error);
      }
    });
  }

  /**
   * 添加事件监听器
   * @param {String} eventName - 事件名称
   * @param {Function} listener - 监听器函数
   */
  on(eventName, listener) {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, []);
    }
    this.eventListeners.get(eventName).push(listener);
  }

  /**
   * 移除事件监听器
   * @param {String} eventName - 事件名称
   * @param {Function} listener - 监听器函数
   */
  off(eventName, listener) {
    const listeners = this.eventListeners.get(eventName) || [];
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  /**
   * 设置自定义元素过滤器
   * @param {Function} filter - 过滤器函数，返回true表示处理该元素
   */
  setElementFilter(filter) {
    this.elementFilter = filter;
  }

  /**
   * 设置自定义颜色验证器
   * @param {Function} validator - 验证器函数，返回true表示颜色有效
   */
  setColorValidator(validator) {
    this.colorValidator = validator;
  }

  /**
   * 检查元素是否应该处理颜色（包括继承的颜色）
   * @param {Element} element - SVG元素
   * @param {String} attribute - 颜色属性名（'fill' 或 'stroke'）
   * @returns {Boolean} 是否应该处理
   */
  shouldProcessElementColor(element, attribute) {
    // 应用自定义过滤器
    if (this.elementFilter && !this.elementFilter(element)) {
      return false;
    }

    // 检查元素自身的属性
    const ownValue = element.getAttribute(attribute);
    
    // 如果元素有明确的颜色值（非none、transparent），则处理
    if (ownValue && ownValue !== 'none' && ownValue !== 'transparent') {
      return true;
    }
    
    // 如果元素没有自己的颜色属性，检查是否从父级继承
    if (!ownValue || ownValue === 'none' || ownValue === 'transparent') {
      // 查找有相应属性的父级<g>元素
      const parentG = element.closest(`g[${attribute}]`);
      if (parentG) {
        const parentValue = parentG.getAttribute(attribute);
        if (parentValue && parentValue !== 'none' && parentValue !== 'transparent') {
          return true;
        }
      }
      
      // 对于既没有自身颜色也没有父级颜色的元素，需要进一步判断
      if (attribute === 'fill') {
        // 检查元素是否有stroke属性，如果只有stroke，则不应该添加fill
        const ownStroke = element.getAttribute('stroke');
        const parentGStroke = element.closest('g[stroke]');
        const hasStroke = (ownStroke && ownStroke !== 'none' && ownStroke !== 'transparent') ||
                         (parentGStroke && parentGStroke.getAttribute('stroke') && 
                          parentGStroke.getAttribute('stroke') !== 'none' && 
                          parentGStroke.getAttribute('stroke') !== 'transparent');
        
        // 如果元素有stroke但没有fill，则不应该添加fill（保持线性风格）
        if (hasStroke && this.config.preserveLinearStyle) {
          return false;
        }
        
        // 如果元素既没有fill也没有stroke，则当作需要fill处理
        return true;
      }
    }
    
    return false;
  }

  /**
   * 生成随机颜色
   * @returns {String} 十六进制颜色值
   */
  generateRandomColor() {
    const colors = this.config.colorPalette;
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    // 应用自定义颜色验证器
    if (this.colorValidator && !this.colorValidator(randomColor)) {
      // 如果验证失败，返回默认颜色
      return '#409eff';
    }
    
    return randomColor;
  }

  /**
   * 生成随机渐变
   * @param {String} id - 渐变的唯一ID
   * @returns {String} 渐变URL引用
   */
  generateRandomGradient(id) {
    const color1 = this.generateRandomColor();
    const color2 = this.generateRandomColor();
    const gradientId = `gradient-${id}-${Date.now()}`;
    
    // 创建渐变定义
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', gradientId);
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '100%');
    gradient.setAttribute('y2', '100%');
    
    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', color1);
    
    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', color2);
    
    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    
    return { gradient, url: `url(#${gradientId})` };
  }

  /**
   * 保存SVG的原始状态
   * @param {Element} svgElement - SVG元素
   * @param {String} svgId - SVG的唯一标识
   */
  saveOriginalState(svgElement, svgId) {
    if (this.svgStates.has(svgId)) {
      return; // 已经保存过了
    }

    const elements = svgElement.querySelectorAll('path, rect, circle, polygon, polyline, line, ellipse, g');
    const originalState = {
      elements: [],
      defs: svgElement.querySelector('defs')?.cloneNode(true) || null
    };

    elements.forEach((element, index) => {
      originalState.elements.push({
        index,
        tagName: element.tagName,
        fill: element.getAttribute('fill'),
        stroke: element.getAttribute('stroke'),
        style: element.getAttribute('style')
      });
    });

    this.svgStates.set(svgId, originalState);
    this.log('info', `已保存SVG原始状态: ${svgId}`, originalState);
  }

  /**
   * 为SVG元素应用随机颜色
   * @param {Element} svgElement - SVG DOM元素
   * @param {Object} options - 处理选项
   * @param {Boolean} options.skipModified - 是否跳过已修改的元素
   * @param {Boolean} options.forceUpdate - 是否强制更新所有元素
   * @returns {Boolean} 处理是否成功
   */
  applyRandomColors(svgElement, options = {}) {
    try {
      if (!svgElement || svgElement.tagName.toLowerCase() !== 'svg') {
        this.log('error', '无效的SVG元素');
        this.emit('error', { error: new Error('无效的SVG元素'), element: svgElement });
        return false;
      }

      const svgId = svgElement.id || `svg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // 保存原始状态
      this.saveOriginalState(svgElement, svgId);

      // 获取所有可着色的元素
      const elements = svgElement.querySelectorAll('path, rect, circle, polygon, polyline, line, ellipse');
      
      if (elements.length === 0) {
        this.log('warn', 'SVG中没有找到可着色的元素');
        return false;
      }

      let processedCount = 0;
      const defsElement = svgElement.querySelector('defs') || this.createDefsElement(svgElement);

      elements.forEach((element, index) => {
        try {
          // 检查是否应该处理填充
          const shouldProcessFill = this.shouldProcessElementColor(element, 'fill');
          const shouldProcessStroke = this.shouldProcessElementColor(element, 'stroke');

          if (shouldProcessFill) {
            const useGradient = Math.random() < this.config.gradientProbability;
            let fillColor;

            if (useGradient) {
              const gradientData = this.generateRandomGradient(`${svgId}-fill-${index}`);
              defsElement.appendChild(gradientData.gradient);
              fillColor = gradientData.url;
            } else {
              fillColor = this.generateRandomColor();
            }

            this.applyColorToElement(element, 'fill', fillColor);
            this.emit('colorApplied', { element, attribute: 'fill', color: fillColor });
          }

          if (shouldProcessStroke) {
            const strokeColor = this.config.independentColors ? 
              this.generateRandomColor() : fillColor || this.generateRandomColor();
            
            this.applyColorToElement(element, 'stroke', strokeColor);
            this.emit('colorApplied', { element, attribute: 'stroke', color: strokeColor });
          }

          processedCount++;
        } catch (error) {
          this.log('error', `处理元素时出错: ${index}`, error);
          this.emit('error', { error, element, index });
        }
      });

      this.log('info', `成功处理 ${processedCount} 个元素`);
      this.emit('complete', { processedCount, totalCount: elements.length, svgElement });
      
      return true;
    } catch (error) {
      this.log('error', '应用随机颜色时出错', error);
      this.emit('error', { error, element: svgElement });
      return false;
    }
  }

  /**
   * 为元素应用颜色
   * @param {Element} element - 目标元素
   * @param {String} attribute - 颜色属性名
   * @param {String} color - 颜色值
   */
  applyColorToElement(element, attribute, color) {
    const originalValue = element.getAttribute(attribute);
    
    // 如果元素没有自己的颜色属性，检查是否需要修改父级
    if (!originalValue || originalValue === 'none' || originalValue === 'transparent') {
      const parentG = element.closest(`g[${attribute}]`);
      if (parentG) {
        parentG.setAttribute(attribute, color);
        this.log('debug', `为父级<g>设置${attribute}颜色: ${color}`);
        return;
      }
    }
    
    // 直接设置元素的颜色属性
    element.setAttribute(attribute, color);
    this.log('debug', `为元素设置${attribute}颜色: ${color}`);
  }

  /**
   * 创建defs元素
   * @param {Element} svgElement - SVG元素
   * @returns {Element} defs元素
   */
  createDefsElement(svgElement) {
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    svgElement.insertBefore(defs, svgElement.firstChild);
    return defs;
  }

  /**
   * 为SVG的特定路径应用随机颜色
   * @param {Element} svgElement - SVG DOM元素
   * @param {Object} options - 处理选项
   * @param {Array} options.pathIndices - 要处理的路径索引数组
   * @param {Boolean} options.independentColors - 是否为每个路径生成独立颜色
   * @returns {Boolean} 处理是否成功
   */
  applyRandomPathColors(svgElement, options = {}) {
    try {
      const { pathIndices, independentColors = true } = options;
      const elements = svgElement.querySelectorAll('path, rect, circle, polygon, polyline, line, ellipse');
      
      if (elements.length === 0) {
        this.log('warn', 'SVG中没有找到可着色的元素');
        return false;
      }

      const targetIndices = pathIndices || Array.from({ length: elements.length }, (_, i) => i);
      let processedCount = 0;

      targetIndices.forEach(index => {
        if (index >= 0 && index < elements.length) {
          const element = elements[index];
          
          const shouldProcessFill = this.shouldProcessElementColor(element, 'fill');
          const shouldProcessStroke = this.shouldProcessElementColor(element, 'stroke');

          if (shouldProcessFill) {
            const fillColor = this.generateRandomColor();
            this.applyColorToElement(element, 'fill', fillColor);
            this.emit('colorApplied', { element, attribute: 'fill', color: fillColor, index });
          }

          if (shouldProcessStroke) {
            const strokeColor = independentColors ? 
              this.generateRandomColor() : fillColor || this.generateRandomColor();
            this.applyColorToElement(element, 'stroke', strokeColor);
            this.emit('colorApplied', { element, attribute: 'stroke', color: strokeColor, index });
          }

          processedCount++;
        }
      });

      this.log('info', `成功处理 ${processedCount} 个指定路径`);
      this.emit('complete', { processedCount, totalCount: targetIndices.length, svgElement });
      
      return true;
    } catch (error) {
      this.log('error', '应用路径随机颜色时出错', error);
      this.emit('error', { error, element: svgElement });
      return false;
    }
  }

  /**
   * 重置SVG元素的颜色到原始状态
   * @param {Element} svgElement - SVG DOM元素
   * @returns {Boolean} 重置是否成功
   */
  resetColors(svgElement) {
    try {
      const svgId = svgElement.id;
      if (!svgId || !this.svgStates.has(svgId)) {
        this.log('warn', '没有找到SVG的原始状态，无法重置');
        return false;
      }

      const originalState = this.svgStates.get(svgId);
      const elements = svgElement.querySelectorAll('path, rect, circle, polygon, polyline, line, ellipse, g');

      // 重置元素属性
      originalState.elements.forEach(originalElement => {
        const element = elements[originalElement.index];
        if (element && element.tagName === originalElement.tagName) {
          // 重置颜色属性
          if (originalElement.fill !== null) {
            element.setAttribute('fill', originalElement.fill);
          } else {
            element.removeAttribute('fill');
          }

          if (originalElement.stroke !== null) {
            element.setAttribute('stroke', originalElement.stroke);
          } else {
            element.removeAttribute('stroke');
          }

          if (originalElement.style !== null) {
            element.setAttribute('style', originalElement.style);
          } else {
            element.removeAttribute('style');
          }
        }
      });

      // 重置defs
      const currentDefs = svgElement.querySelector('defs');
      if (currentDefs) {
        currentDefs.remove();
      }
      if (originalState.defs) {
        svgElement.insertBefore(originalState.defs.cloneNode(true), svgElement.firstChild);
      }

      this.log('info', `成功重置SVG颜色: ${svgId}`);
      this.emit('reset', { svgElement, svgId });
      
      return true;
    } catch (error) {
      this.log('error', '重置SVG颜色时出错', error);
      this.emit('error', { error, element: svgElement });
      return false;
    }
  }

  /**
   * 获取SVG元素的当前颜色状态
   * @param {Element} svgElement - SVG DOM元素
   * @returns {Object} 颜色状态信息
   */
  getColorState(svgElement) {
    try {
      const elements = svgElement.querySelectorAll('path, rect, circle, polygon, polyline, line, ellipse');
      const colorState = {
        totalElements: elements.length,
        fillElements: 0,
        strokeElements: 0,
        gradientElements: 0,
        inheritedElements: 0,
        elements: []
      };

      elements.forEach((element, index) => {
        const fill = element.getAttribute('fill');
        const stroke = element.getAttribute('stroke');
        const hasFill = fill && fill !== 'none' && fill !== 'transparent';
        const hasStroke = stroke && stroke !== 'none' && stroke !== 'transparent';
        const hasGradient = (fill && fill.startsWith('url(')) || (stroke && stroke.startsWith('url('));
        const hasInheritance = this.checkInheritance(element);

        if (hasFill) colorState.fillElements++;
        if (hasStroke) colorState.strokeElements++;
        if (hasGradient) colorState.gradientElements++;
        if (hasInheritance) colorState.inheritedElements++;

        colorState.elements.push({
          index,
          tagName: element.tagName,
          fill,
          stroke,
          hasFill,
          hasStroke,
          hasGradient,
          hasInheritance
        });
      });

      return colorState;
    } catch (error) {
      this.log('error', '获取颜色状态时出错', error);
      return null;
    }
  }

  /**
   * 检查元素是否有颜色继承
   * @param {Element} element - 要检查的元素
   * @returns {Boolean} 是否有继承
   */
  checkInheritance(element) {
    const fillParent = element.closest('g[fill]');
    const strokeParent = element.closest('g[stroke]');
    return !!(fillParent || strokeParent);
  }

  /**
   * 清除所有保存的状态
   */
  clearStates() {
    this.svgStates.clear();
    this.log('info', '已清除所有保存的状态');
  }

  /**
   * 获取库的版本信息
   * @returns {String} 版本号
   */
  getVersion() {
    return '1.0.0';
  }

  /**
   * 获取库的统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    return {
      version: this.getVersion(),
      savedStates: this.svgStates.size,
      eventListeners: Array.from(this.eventListeners.entries()).reduce((acc, [event, listeners]) => {
        acc[event] = listeners.length;
        return acc;
      }, {}),
      config: { ...this.config }
    };
  }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
  // Node.js 环境
  module.exports = SVGSmartColorizer;
} else if (typeof define === 'function' && define.amd) {
  // AMD 环境
  define([], function() {
    return SVGSmartColorizer;
  });
} else {
  // 浏览器环境
  window.SVGSmartColorizer = SVGSmartColorizer;
}

// 默认导出
if (typeof exports !== 'undefined') {
  exports.default = SVGSmartColorizer;
}