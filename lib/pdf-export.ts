import { AnalysisResult } from "./types";

interface RGB {
  r: number;
  g: number;
  b: number;
}

/**
 * Generate a minimal, professional PDF report with Caffeine theme
 */
export async function generatePDFReport(result: AnalysisResult): Promise<Blob> {
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPosition = margin;

  // Caffeine Theme
  const colors = {
    espresso: { r: 59, g: 36, b: 27 } as RGB,
    coffee: { r: 111, g: 78, b: 55 } as RGB,
    latte: { r: 196, g: 164, b: 132 } as RGB,
    cream: { r: 245, g: 240, b: 230 } as RGB,
    caramel: { r: 198, g: 134, b: 66 } as RGB,
    mocha: { r: 140, g: 102, b: 75 } as RGB,
    black: { r: 28, g: 25, b: 23 } as RGB,
    charcoal: { r: 64, g: 58, b: 54 } as RGB,
    stone: { r: 120, g: 113, b: 108 } as RGB,
    sand: { r: 214, g: 204, b: 194 } as RGB,
    paper: { r: 253, g: 251, b: 247 } as RGB,
    white: { r: 255, g: 255, b: 255 } as RGB,
    success: { r: 76, g: 129, b: 89 } as RGB,
    warning: { r: 180, g: 130, b: 60 } as RGB,
    danger: { r: 168, g: 82, b: 75 } as RGB,
  };

  // Helper Functions
  const setColor = (color: RGB, type: "fill" | "text" | "draw" = "text") => {
    if (type === "fill") doc.setFillColor(color.r, color.g, color.b);
    else if (type === "draw") doc.setDrawColor(color.r, color.g, color.b);
    else doc.setTextColor(color.r, color.g, color.b);
  };

  const addNewPageIfNeeded = (requiredSpace: number = 25): boolean => {
    if (yPosition + requiredSpace > pageHeight - 25) {
      doc.addPage();
      yPosition = margin;
      addPageBackground();
      return true;
    }
    return false;
  };

  const addPageBackground = () => {
    setColor(colors.paper, "fill");
    doc.rect(0, 0, pageWidth, pageHeight, "F");
  };

  const getScoreColor = (score: number): RGB => {
    if (score >= 70) return colors.success;
    if (score >= 40) return colors.warning;
    return colors.danger;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  // Simple dot icon (bullet point)
  const drawDot = (x: number, y: number, color: RGB) => {
    setColor(color, "fill");
    doc.circle(x, y, 0.8, "F");
  };

  // Draw a single stat item with dot indicator
  const drawStatItem = (
    x: number,
    y: number,
    label: string,
    value: string,
    dotColor: RGB
  ): number => {
    // Draw dot
    drawDot(x + 1, y - 1, dotColor);

    // Draw text
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    setColor(colors.stone);
    doc.text(label, x + 4, y);

    doc.setFont("helvetica", "bold");
    setColor(colors.charcoal);
    const labelWidth = doc.getTextWidth(label + " ");
    doc.text(value, x + 4 + labelWidth, y);

    const totalWidth = 4 + labelWidth + doc.getTextWidth(value);
    return totalWidth;
  };

  // Draw section divider
  const drawDivider = () => {
    setColor(colors.sand, "draw");
    doc.setLineWidth(0.3);
    doc.line(margin, yPosition, margin + 30, yPosition);
    yPosition += 6;
  };

  // Draw section header
  const drawSectionHeader = (title: string) => {
    addNewPageIfNeeded(25);
    yPosition += 4;

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    setColor(colors.espresso);
    doc.text(title.toUpperCase(), margin, yPosition);

    setColor(colors.latte, "draw");
    doc.setLineWidth(0.5);
    doc.line(
      margin,
      yPosition + 2,
      margin + doc.getTextWidth(title.toUpperCase()) + 2,
      yPosition + 2
    );

    yPosition += 10;
  };

  // Draw table
  const drawTable = (
    headers: string[],
    rows: string[][],
    colWidths: number[]
  ) => {
    const rowHeight = 8;
    const headerHeight = 9;
    const padding = 4;

    addNewPageIfNeeded(headerHeight + Math.min(rows.length, 3) * rowHeight + 5);

    // Header
    setColor(colors.cream, "fill");
    doc.rect(margin, yPosition, contentWidth, headerHeight, "F");

    setColor(colors.latte, "draw");
    doc.setLineWidth(0.3);
    doc.line(
      margin,
      yPosition + headerHeight,
      margin + contentWidth,
      yPosition + headerHeight
    );

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    setColor(colors.coffee);

    let xOffset = margin + padding;
    headers.forEach((header, i) => {
      doc.text(header, xOffset, yPosition + 6);
      xOffset += colWidths[i];
    });

    yPosition += headerHeight;

    // Rows
    rows.forEach((row) => {
      if (addNewPageIfNeeded(rowHeight)) {
        setColor(colors.cream, "fill");
        doc.rect(margin, yPosition, contentWidth, headerHeight, "F");
        setColor(colors.latte, "draw");
        doc.setLineWidth(0.3);
        doc.line(
          margin,
          yPosition + headerHeight,
          margin + contentWidth,
          yPosition + headerHeight
        );

        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        setColor(colors.coffee);
        let xOff = margin + padding;
        headers.forEach((header, i) => {
          doc.text(header, xOff, yPosition + 6);
          xOff += colWidths[i];
        });
        yPosition += headerHeight;
      }

      setColor(colors.sand, "draw");
      doc.setLineWidth(0.15);
      doc.line(
        margin,
        yPosition + rowHeight,
        margin + contentWidth,
        yPosition + rowHeight
      );

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      setColor(colors.charcoal);

      let xPos = margin + padding;
      row.forEach((cell, i) => {
        const maxWidth = colWidths[i] - padding * 2;
        let displayText = cell;

        while (
          doc.getTextWidth(displayText) > maxWidth &&
          displayText.length > 3
        ) {
          displayText = displayText.slice(0, -4) + "...";
        }

        doc.text(displayText, xPos, yPosition + 5.5);
        xPos += colWidths[i];
      });

      yPosition += rowHeight;
    });

    yPosition += 6;
  };

  // Draw score circle
  const drawScoreCircle = (
    x: number,
    y: number,
    score: number,
    label: string
  ) => {
    const radius = 14;
    const scoreColor = getScoreColor(score);

    // Background circle
    setColor(colors.sand, "draw");
    doc.setLineWidth(1.5);
    doc.circle(x, y, radius, "S");

    // Score arc
    setColor(scoreColor, "draw");
    doc.setLineWidth(2);

    const segments = Math.floor((score / 100) * 32);
    for (let i = 0; i < segments; i++) {
      const startAngle = (i * (360 / 32) - 90) * (Math.PI / 180);
      const endAngle = ((i + 1) * (360 / 32) - 90) * (Math.PI / 180);
      const x1 = x + radius * Math.cos(startAngle);
      const y1 = y + radius * Math.sin(startAngle);
      const x2 = x + radius * Math.cos(endAngle);
      const y2 = y + radius * Math.sin(endAngle);
      doc.line(x1, y1, x2, y2);
    }

    // Score number
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    setColor(colors.espresso);
    doc.text(score.toString(), x, y + 2, { align: "center" });

    // Label
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    setColor(colors.stone);
    doc.text(label, x, y + radius + 5, { align: "center" });
  };

  // Draw score bar
  const drawScoreBar = (
    x: number,
    y: number,
    width: number,
    score: number,
    label: string
  ): number => {
    const barHeight = 3;
    const scoreColor = getScoreColor(score);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    setColor(colors.charcoal);
    doc.text(label, x, y);

    doc.setFont("helvetica", "bold");
    setColor(scoreColor);
    doc.text(score.toString(), x + width + 10, y);

    setColor(colors.sand, "fill");
    doc.roundedRect(x, y + 2, width, barHeight, 1, 1, "F");

    const scoreWidth = Math.max((score / 100) * width, 2);
    setColor(scoreColor, "fill");
    doc.roundedRect(x, y + 2, scoreWidth, barHeight, 1, 1, "F");

    return y + 12;
  };

  // Draw multi-line text block (no truncation)
  const drawTextBlock = (
    text: string,
    x: number,
    startY: number,
    maxWidth: number,
    fontSize: number = 9,
    lineHeight: number = 4.5
  ): number => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", "normal");
    setColor(colors.charcoal);

    const lines = doc.splitTextToSize(text, maxWidth);

    lines.forEach((line: string, i: number) => {
      const currentY = startY + i * lineHeight;

      // Check if we need a new page
      if (currentY > pageHeight - 25) {
        doc.addPage();
        addPageBackground();
        yPosition = margin;
      }

      doc.text(line, x, startY + i * lineHeight);
    });

    return lines.length * lineHeight;
  };

  // ==================== BUILD PDF ====================

  addPageBackground();

  // === HEADER ===
  setColor(colors.caramel, "fill");
  doc.rect(margin, yPosition, 3, 18, "F");

  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  setColor(colors.espresso);
  doc.text(result.metadata.name, margin + 8, yPosition + 8);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  setColor(colors.stone);
  doc.text(result.metadata.fullName, margin + 8, yPosition + 15);

  yPosition += 24;

  // === STATS ROW - Simple dot indicators ===
  const statsY = yPosition;
  let statsX = margin;
  const statGap = 16;

  // Stars
  statsX +=
    drawStatItem(
      statsX,
      statsY,
      "stars",
      formatNumber(result.metadata.stars),
      colors.caramel
    ) + statGap;

  // Forks
  statsX +=
    drawStatItem(
      statsX,
      statsY,
      "forks",
      formatNumber(result.metadata.forks),
      colors.mocha
    ) + statGap;

  // Language
  if (result.metadata.language) {
    statsX +=
      drawStatItem(
        statsX,
        statsY,
        "",
        result.metadata.language,
        colors.coffee
      ) + statGap;
  }

  // License
  if (result.metadata.license) {
    drawStatItem(statsX, statsY, "License", result.metadata.license, colors.stone);
  }

  yPosition += 10;
  drawDivider();

  // === SCORE OVERVIEW ===
  const scoreY = yPosition;

  drawScoreCircle(
    margin + 20,
    scoreY + 16,
    result.scores?.overall || 0,
    "Overall Score"
  );

  const barX = margin + 50;
  const barWidth = 45;
  const barY = scoreY + 4;

  const scores = [
    { label: "Code Quality", value: result.scores?.codeQuality || 0 },
    { label: "Documentation", value: result.scores?.documentation || 0 },
    { label: "Security", value: result.scores?.security || 0 },
    { label: "Maintainability", value: result.scores?.maintainability || 0 },
    { label: "Test Coverage", value: result.scores?.testCoverage || 0 },
    { label: "Dependencies", value: result.scores?.dependencies || 0 },
  ];

  scores.slice(0, 3).forEach((s, i) => {
    drawScoreBar(barX, barY + i * 11, barWidth, s.value, s.label);
  });

  scores.slice(3).forEach((s, i) => {
    drawScoreBar(barX + 62, barY + i * 11, barWidth, s.value, s.label);
  });

  yPosition = scoreY + 42;

  // === SUMMARY ===
  if (result.summary) {
    drawSectionHeader("Summary");

    const summaryHeight = drawTextBlock(
      result.summary,
      margin,
      yPosition,
      contentWidth,
      9,
      4.5
    );

    yPosition += summaryHeight + 6;
  }

  // === PURPOSE (Full text, no truncation) ===
  if (result.whatItDoes) {
    addNewPageIfNeeded(20);

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    setColor(colors.coffee);
    doc.text("PURPOSE", margin, yPosition);

    yPosition += 5;

    const purposeHeight = drawTextBlock(
      result.whatItDoes,
      margin,
      yPosition,
      contentWidth,
      9,
      4.5
    );

    yPosition += purposeHeight + 6;
  }

  // === TARGET AUDIENCE (if exists) ===
  if (result.targetAudience) {
    addNewPageIfNeeded(20);

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    setColor(colors.coffee);
    doc.text("TARGET AUDIENCE", margin, yPosition);

    yPosition += 5;

    const audienceHeight = drawTextBlock(
      result.targetAudience,
      margin,
      yPosition,
      contentWidth,
      9,
      4.5
    );

    yPosition += audienceHeight + 6;
  }

  // === TECH STACK ===
  if (result.techStack && result.techStack.length > 0) {
    addNewPageIfNeeded(15);

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    setColor(colors.coffee);
    doc.text("TECH STACK", margin, yPosition);

    yPosition += 6;

    let techX = margin;
    const techY = yPosition;
    const pillPadding = 3;
    const pillHeight = 5;
    const pillGap = 2;
    let currentRow = 0;
    const rowHeight = 7;

    doc.setFontSize(7);

    result.techStack.slice(0, 12).forEach((tech) => {
      const textWidth = doc.getTextWidth(tech);
      const pillWidth = textWidth + pillPadding * 2;

      // Wrap to next line if needed
      if (techX + pillWidth > margin + contentWidth) {
        techX = margin;
        currentRow++;
      }

      const pillY = techY + currentRow * rowHeight;

      // Pill background
      setColor(colors.cream, "fill");
      doc.roundedRect(techX, pillY - 3.5, pillWidth, pillHeight, 1, 1, "F");

      // Pill border
      setColor(colors.sand, "draw");
      doc.setLineWidth(0.2);
      doc.roundedRect(techX, pillY - 3.5, pillWidth, pillHeight, 1, 1, "S");

      // Text
      setColor(colors.coffee);
      doc.text(tech, techX + pillPadding, pillY);

      techX += pillWidth + pillGap;
    });

    yPosition = techY + (currentRow + 1) * rowHeight + 4;
  }

  // === QUICK START ===
  if (result.howToRun && result.howToRun.length > 0) {
    drawSectionHeader("Quick Start");

    const commands = result.howToRun.slice(0, 4);

    setColor(colors.espresso, "fill");
    const codeHeight = commands.length * 6 + 6;
    doc.roundedRect(margin, yPosition, contentWidth, codeHeight, 2, 2, "F");

    doc.setFontSize(8);
    doc.setFont("courier", "normal");
    setColor(colors.cream);

    commands.forEach((cmd, i) => {
      const cmdText = cmd.length > 75 ? cmd.substring(0, 75) + "..." : cmd;
      doc.text("$ " + cmdText, margin + 4, yPosition + 5 + i * 6);
    });

    yPosition += codeHeight + 8;
  }

  // === KEY FOLDERS ===
  if (result.keyFolders && result.keyFolders.length > 0) {
    drawSectionHeader("Structure");

    const folderRows = result.keyFolders
      .slice(0, 5)
      .map((f) => [
        f.name,
        f.description.substring(0, 60) +
          (f.description.length > 60 ? "..." : ""),
      ]);

    drawTable(["Folder", "Purpose"], folderRows, [35, contentWidth - 35]);
  }

  // === INSIGHTS ===
  if (result.insights && result.insights.length > 0) {
    drawSectionHeader("Insights");

    const topInsights = result.insights.slice(0, 5);

    const insightRows = topInsights.map((insight) => {
      const typeLabel =
        insight.type === "strength"
          ? "+"
          : insight.type === "warning"
          ? "!"
          : "-";
      return [
        typeLabel,
        insight.title.substring(0, 45) +
          (insight.title.length > 45 ? "..." : ""),
        insight.priority.charAt(0).toUpperCase() + insight.priority.slice(1),
      ];
    });

    drawTable(["", "Finding", "Priority"], insightRows, [
      8,
      contentWidth - 33,
      25,
    ]);
  }

  // === REFACTORING ===
  if (result.refactors && result.refactors.length > 0) {
    drawSectionHeader("Refactoring");

    const refactorRows = result.refactors
      .slice(0, 4)
      .map((r) => [
        r.title.substring(0, 45) + (r.title.length > 45 ? "..." : ""),
        r.impact.charAt(0).toUpperCase() + r.impact.slice(1),
        r.effort.charAt(0).toUpperCase() + r.effort.slice(1),
      ]);

    drawTable(["Opportunity", "Impact", "Effort"], refactorRows, [
      contentWidth - 45,
      22,
      23,
    ]);
  }

  // === AUTOMATIONS ===
  if (result.automations && result.automations.length > 0) {
    drawSectionHeader("Automations");

    const autoRows = result.automations
      .slice(0, 4)
      .map((a) => [
        a.type.replace("-", " ").charAt(0).toUpperCase() +
          a.type.replace("-", " ").slice(1),
        a.title.substring(0, 55) + (a.title.length > 55 ? "..." : ""),
      ]);

    drawTable(["Type", "Suggestion"], autoRows, [30, contentWidth - 30]);
  }

  // === FOOTER ===
  const totalPages = doc.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    setColor(colors.sand, "draw");
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    setColor(colors.mocha);
    doc.text("RepoGist", margin, pageHeight - 8);

    setColor(colors.stone);
    doc.text(i + " / " + totalPages, pageWidth / 2, pageHeight - 8, {
      align: "center",
    });

    doc.text(
      new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      pageWidth - margin,
      pageHeight - 8,
      { align: "right" }
    );
  }

  return doc.output("blob");
}

/**
 * Download the PDF report
 */
export async function downloadPDFReport(
  result: AnalysisResult,
  filename?: string
): Promise<boolean> {
  try {
    const blob = await generatePDFReport(result);
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename || result.metadata.name + "-report.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error("Failed to generate PDF:", error);
    return false;
  }
}

/**
 * Open PDF in new tab for preview
 */
export async function previewPDFReport(
  result: AnalysisResult
): Promise<boolean> {
  try {
    const blob = await generatePDFReport(result);
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    return true;
  } catch (error) {
    console.error("Failed to preview PDF:", error);
    return false;
  }
}
