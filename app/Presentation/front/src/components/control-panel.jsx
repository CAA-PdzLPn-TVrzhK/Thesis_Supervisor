import React from 'react';
import { Input, Button, Popover, Form, Select, Radio, Space } from 'antd';

const { Search } = Input;
const { Option } = Select;

export default function ControlPanel({ onSearch, onFilter, onSort, onAdd, onEditMode, groupOptions = [], yearOptions = []}) {
  const [filterForm] = Form.useForm();
  const [sortForm]    = Form.useForm();

  const applyFilters = () => {
    onFilter(filterForm.getFieldsValue());
  };
  const resetFilters = () => {
    filterForm.resetFields();
    onFilter({});
  };

  const applySort = () => {
    onSort(sortForm.getFieldsValue());
  };
  const resetSort = () => {
    sortForm.resetFields();
    onSort({});
  };

  const filterContent = (
    <Form form={filterForm} layout="vertical" className="cp-form">
      <Form.Item name="group" label="Group">
        <Select placeholder="Select group" allowClear mode="multiple">
          {groupOptions.map(group => (
            <Option key={group} value={group}>{group}</Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name="year" label="Year">
        <Select placeholder="Select year" allowClear mode="multiple">
          {yearOptions.map(year => (
            <Option key={year} value={year}>{year}</Option>
          ))}
        </Select>
      </Form.Item>
      <Space className="cp-form-buttons">
        <Button size="small" onClick={resetFilters} className={"resetButton"}>Reset</Button>
        <Button size="small" onClick={applyFilters} className={"applyButton"}>Apply</Button>
      </Space>
    </Form>
  );

  const sortContent = (
    <Form form={sortForm} layout="vertical" className="cp-form">
      <Form.Item name="field" label="Field">
        <Select placeholder="Select field" allowClear>
          <Option value="id">ID</Option>
          <Option value="points">Points</Option>
          <Option value="year">Year</Option>
        </Select>
      </Form.Item>
      <Form.Item name="order" label="Order">
        <Radio.Group>
          <Radio value="asc">Ascending</Radio>
          <Radio value="desc">Descending</Radio>
        </Radio.Group>
      </Form.Item>
      <Space className="cp-form-buttons">
        <Button size="small" onClick={resetSort} className={"resetButton"}>Reset</Button>
        <Button size="small" onClick={applySort} className={"applyButton"}>Apply</Button>
      </Space>
    </Form>
  );

  return (
      <div className="control-panel">
          <Search
              placeholder="Search…"
              allowClear
              onSearch={onSearch}
              style={{width: 240}}
          />

          <Popover
              content={filterContent}
              title="Filters"
              trigger="click"
              placement="bottomLeft"
          >
              <Button>Filters ▼</Button>
          </Popover>

          <Popover
              content={sortContent}
              title="Sort"
              trigger="click"
              placement="bottomLeft"
          >
              <Button>Sort ▼</Button>
          </Popover>
              <button className="addButton" onClick={onAdd}>Add student</button>
              <button className="changeButton" onClick={onEditMode}>Edit student</button>
      </div>
  );
}