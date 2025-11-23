import React from "react";
import * as Accordion from "@radix-ui/react-accordion";
import "./AccordionStyles.css";
import ACard from "./Acard";

export default function ProjectAccordion() {
  return (
    <Accordion.Root type="multiple" className="accordion-root">
      {/* ABC PROJECTS */}
      <Accordion.Item value="abc" className="acc-item">
        <Accordion.Header className="acc-header">
          <Accordion.Trigger className="acc-trigger">
            <div className="left-sec">
              <span className="chevron" />
              <span className="acc-title">ABC Projects</span>
              <span className="count-badge">3</span>
            </div>
          </Accordion.Trigger>
        </Accordion.Header>

        <Accordion.Content className="acc-content">
          <div className="card-row">
            <ACard />
            <ACard />
            <ACard />
          </div>
        </Accordion.Content>
      </Accordion.Item>

      {/* XYZ PROJECT */}
      <Accordion.Item value="xyz" className="acc-item">
        <Accordion.Header className="acc-header">
          <Accordion.Trigger className="acc-trigger">
            <div className="left-sec">
              <span className="chevron" />
              <span className="acc-title">Xyz Project</span>
              <span className="count-badge">2</span>
            </div>
          </Accordion.Trigger>
        </Accordion.Header>
        {/* content */}
      </Accordion.Item>

      {/* 123 PROJECTS */}
      <Accordion.Item value="123" className="acc-item">
        <Accordion.Header className="acc-header">
          <Accordion.Trigger className="acc-trigger">
            <div className="left-sec">
              <span className="chevron" />
              <span className="acc-title">123 Projects</span>
              <span className="count-badge">5</span>
            </div>
          </Accordion.Trigger>
        </Accordion.Header>
        {/* contetn */}
      </Accordion.Item>
    </Accordion.Root>
  );
}
