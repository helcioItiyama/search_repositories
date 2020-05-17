/* eslint-disable react/static-property-placement */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import api from '../../services/api';
import Container from '../../components/Container';
import { Loading, Owner, IssuesList, Menu } from './styles';

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    type: 'all',
  };

  async componentDidMount() {
    const { match } = this.props;
    const { type } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          // axios use for params
          state: type,
          per_page: 5,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  handleIssue = async () => {
    const { match } = this.props;
    const { type } = this.state;
    const repoName = decodeURIComponent(match.params.repository);
    const issues = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state: type,
        per_page: 5,
      },
    });

    this.setState({
      issues: issues.data,
      loading: false,
    });
  };

  async handleFilter(type) {
    await this.setState({ type });

    this.handleIssue();
  }

  render() {
    const { repository, issues, loading, type } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>

        <Menu>
          <button
            type="button"
            selected={type === 'open'}
            onClick={() => this.handleFilter('open')}
          >
            Open
          </button>

          <button
            type="button"
            selected={type === 'closed'}
            onClick={() => this.handleFilter('closed')}
          >
            Closed
          </button>

          <button
            type="button"
            selected={type === 'all'}
            onClick={() => this.handleFilter('all')}
          >
            All
          </button>
        </Menu>

        <IssuesList>
          {issues.map((issue) => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />

              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map((label) => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>

                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssuesList>
      </Container>
    );
  }
}
